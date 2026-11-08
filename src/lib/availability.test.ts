import { describe, it, expect } from "vitest";
import {
  checkAvailability,
  overlapsWith,
  toMinutes,
  MAX_MINUTES,
} from "@/lib/availability";
import { type Booking, type Room } from "@/lib/types";
import { ROOMS } from "@/lib/rooms";

// Controlled fixtures used to exercise the rule logic in isolation.
// These mirror the shape of the ROOMS data in rooms.ts but are owned by the test
// so that booking data is never mutated by tests.

const openRoom: Room = {
  id: "t-open",
  name: "T-OPEN",
  building: "Test Building",
  floor: 1,
  capacity: 20,
  equipment: ["Projector", "Whiteboard"],
  isBlocked: false,
  bookings: [
    { id: "x1", start: "10:00", end: "11:00", bookedBy: "Test", purpose: "Block A" },
  ],
};

const blockedRoom: Room = {
  id: "t-blocked",
  name: "T-BLOCKED",
  building: "Test Building",
  floor: 1,
  capacity: 20,
  equipment: ["Projector"],
  isBlocked: true,
  bookings: [],
};

// "now" expressed as minutes since midnight. 16:49 => 16*60 + 49.
const NOW_16_49 = 16 * 60 + 49;

function isUnavailable(r: ReturnType<typeof checkAvailability>): r is {
  status: "unavailable";
  reasons: string[];
} {
  return r.status === "unavailable";
}

describe("toMinutes", () => {
  it("parses HH:MM into minutes since midnight", () => {
    expect(toMinutes("00:00")).toBe(0);
    expect(toMinutes("16:49")).toBe(16 * 60 + 49);
    expect(toMinutes("24:00")).toBe(24 * 60);
  });

  it("returns NaN for malformed input", () => {
    expect(toMinutes("")).toBeNaN();
    expect(toMinutes("abc")).toBeNaN();
    expect(toMinutes("9")).toBeNaN();
  });
});

// AC1: booking start must be strictly later than the current time.
// Equal-to-now and earlier-than-now must be rejected.
describe("AC1 — start strictly later than current time", () => {
  it("rejects a start equal to the current hour and minute", () => {
    const res = checkAvailability("16:49", "17:00", NOW_16_49, openRoom);
    expect(isUnavailable(res)).toBe(true);
    if (isUnavailable(res)) {
      expect(res.reasons).toContain("Start time must be strictly later than the current time.");
    }
  });

  it("rejects a start earlier than the current time", () => {
    const res = checkAvailability("16:00", "17:00", NOW_16_49, openRoom);
    expect(isUnavailable(res)).toBe(true);
    if (isUnavailable(res)) {
      expect(res.reasons).toContain("Start time must be strictly later than the current time.");
    }
  });

  it("accepts a start strictly later than the current time", () => {
    const res = checkAvailability("16:50", "17:30", NOW_16_49, openRoom);
    expect(res.status).toBe("available");
  });
});

// AC2 (duration): max 120 minutes, exactly 120 allowed, 121 rejected.
describe("AC2 — duration up to 120 minutes", () => {
  it("accepts a duration of exactly 120 minutes", () => {
    const res = checkAvailability("16:50", "18:50", NOW_16_49, openRoom);
    expect(res.status).toBe("available");
  });

  it("rejects a 121-minute duration", () => {
    const res = checkAvailability("16:50", "18:51", NOW_16_49, openRoom);
    expect(isUnavailable(res)).toBe(true);
    if (isUnavailable(res)) {
      expect(res.reasons.some((r) => r.includes("exceeds the 120-minute maximum"))).toBe(true);
    }
  });
});

// AC3: a blocked room is always unavailable.
describe("AC3 — blocked room always unavailable", () => {
  it("rejects any booking on a blocked room", () => {
    const res = checkAvailability("16:50", "17:30", NOW_16_49, blockedRoom);
    expect(isUnavailable(res)).toBe(true);
    if (isUnavailable(res)) {
      expect(res.reasons).toContain("This room is currently blocked and cannot be booked.");
    }
  });
});

// AC4: overlap detection; endpoint touching allowed.
describe("AC4 — overlap and touching endpoints", () => {
  it("rejects a request that overlaps an existing booking", () => {
    // existing 10:00–11:00; request 10:30–11:30 overlaps.
    const res = checkAvailability("10:30", "11:30", 9 * 60, openRoom);
    expect(isUnavailable(res)).toBe(true);
    if (isUnavailable(res)) {
      expect(res.reasons.some((r) => r.includes("Overlaps with an existing booking"))).toBe(true);
    }
  });

  it("allows a request that starts exactly when the existing booking ends (touching)", () => {
    // existing 10:00–11:00; request 11:00–12:00 touches at endpoint.
    const res = checkAvailability("11:00", "12:00", 9 * 60, openRoom);
    expect(res.status).toBe("available");
  });

  it("allows a request that ends exactly when the existing booking starts (touching)", () => {
    // existing 10:00–11:00; request 09:00–10:00 touches at endpoint.
    const res = checkAvailability("09:00", "10:00", 8 * 60, openRoom);
    expect(res.status).toBe("available");
  });

  it("overlapsWith returns the colliding booking", () => {
    const bookings: Booking[] = [
      { id: "o1", start: "10:00", end: "11:00", bookedBy: "T", purpose: "p" },
    ];
    const hit = overlapsWith(toMinutes("10:30"), toMinutes("11:30"), bookings);
    expect(hit).not.toBeNull();
    expect(hit?.id).toBe("o1");
  });

  it("overlapsWith returns null for a touching request", () => {
    const bookings: Booking[] = [
      { id: "o1", start: "10:00", end: "11:00", bookedBy: "T", purpose: "p" },
    ];
    expect(overlapsWith(toMinutes("11:00"), toMinutes("12:00"), bookings)).toBeNull();
  });
});

// AC5: valid time range; end must be later than start; within 00:00–24:00.
describe("AC5 — valid range and reversed interval", () => {
  it("rejects a reversed interval (end <= start)", () => {
    const res = checkAvailability("17:00", "16:00", NOW_16_49, openRoom);
    expect(isUnavailable(res)).toBe(true);
    if (isUnavailable(res)) {
      expect(res.reasons).toContain("End time must be later than the start time.");
    }
  });

  it("rejects equal start and end", () => {
    const res = checkAvailability("17:00", "17:00", NOW_16_49, openRoom);
    expect(isUnavailable(res)).toBe(true);
    if (isUnavailable(res)) {
      expect(res.reasons).toContain("End time must be later than the start time.");
    }
  });
});

// AC6: missing or malformed times.
describe("AC6 — missing input", () => {
  it("rejects when both times are empty", () => {
    const res = checkAvailability("", "", NOW_16_49, openRoom);
    expect(isUnavailable(res)).toBe(true);
    if (isUnavailable(res)) {
      expect(res.reasons).toContain("Please enter both a start and end time.");
    }
  });

  it("rejects when one time is empty", () => {
    const res = checkAvailability("16:50", "", NOW_16_49, openRoom);
    expect(isUnavailable(res)).toBe(true);
  });
});

// Fixture integrity: the rule constants and helper behavior must stay stable.
describe("unchanged fixtures / constants", () => {
  it("MAX_MINUTES remains 120", () => {
    expect(MAX_MINUTES).toBe(120);
  });

  it("toMinutes is a pure inverse of the HH:MM format used by fixtures", () => {
    expect(toMinutes("10:00")).toBe(600);
    expect(toMinutes("11:00")).toBe(660);
  });

  it("the controlled open-room fixture has its single booking intact", () => {
    expect(openRoom.isBlocked).toBe(false);
    expect(openRoom.bookings).toHaveLength(1);
    expect(openRoom.bookings[0].start).toBe("10:00");
    expect(openRoom.bookings[0].end).toBe("11:00");
  });

  it("the controlled blocked-room fixture is blocked with no bookings", () => {
    expect(blockedRoom.isBlocked).toBe(true);
    expect(blockedRoom.bookings).toHaveLength(0);
  });
});

// ---- ROOMS fixture integrity (production data) ----

describe("ROOMS production fixture integrity", () => {
  it("contains at least four rooms", () => {
    expect(ROOMS.length).toBeGreaterThanOrEqual(4);
  });

  it("every room has all required fields", () => {
    for (const r of ROOMS) {
      expect(typeof r.id).toBe("string");
      expect(typeof r.name).toBe("string");
      expect(typeof r.building).toBe("string");
      expect(typeof r.floor).toBe("number");
      expect(typeof r.capacity).toBe("number");
      expect(Array.isArray(r.equipment)).toBe(true);
      expect(typeof r.isBlocked).toBe("boolean");
      expect(Array.isArray(r.bookings)).toBe(true);
    }
  });

  it("every booking has start, end, bookedBy, and purpose", () => {
    for (const r of ROOMS) {
      for (const b of r.bookings) {
        expect(typeof b.id).toBe("string");
        expect(typeof b.start).toBe("string");
        expect(typeof b.end).toBe("string");
        expect(typeof b.bookedBy).toBe("string");
        expect(typeof b.purpose).toBe("string");
      }
    }
  });

  it("has exactly one blocked room (A-102)", () => {
    const blocked = ROOMS.filter((r) => r.isBlocked);
    expect(blocked).toHaveLength(1);
    expect(blocked[0].id).toBe("a-102");
  });
});
