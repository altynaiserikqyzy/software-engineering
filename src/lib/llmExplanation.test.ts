import { describe, it, expect } from "vitest";
import { checkAvailability } from "@/lib/availability";
import { explainAvailability, type ExplanationInput } from "@/lib/llmExplanation";
import type { Room } from "@/lib/types";

const openRoom: Room = {
  id: "t-open",
  name: "T-OPEN",
  building: "Test Building",
  floor: 1,
  capacity: 20,
  equipment: ["Projector"],
  isBlocked: false,
  bookings: [
    { id: "x1", start: "10:00", end: "11:00", bookedBy: "Test", purpose: "Block A" },
  ],
};

const NOW_9_00 = 9 * 60;

function availableInput(): ExplanationInput {
  return {
    roomName: "T-OPEN",
    start: "12:00",
    end: "13:00",
    result: checkAvailability("12:00", "13:00", NOW_9_00, openRoom),
  };
}

function unavailableInput(): ExplanationInput {
  return {
    roomName: "T-OPEN",
    start: "10:30",
    end: "11:30",
    result: checkAvailability("10:30", "11:30", NOW_9_00, openRoom),
  };
}

// Input validation: only checker-shaped facts are accepted.
describe("explainAvailability — input validation", () => {
  it("rejects a missing room name", () => {
    const input = { ...availableInput(), roomName: "  " };
    const out = explainAvailability(input);
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.error).toContain("room name");
  });

  it("rejects malformed time strings", () => {
    const out = explainAvailability({ ...availableInput(), start: "abc" });
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.error).toContain("HH:MM");
  });

  // Regression: the adapter must accept any time the checker accepts. The
  // checker validates with /^\d+:\d+$/ (e.g. "9:00"), so the adapter must not
  // reject single-digit-hour inputs.
  it("accepts a single-digit-hour time like '9:00' that the checker accepts", () => {
    const result = checkAvailability("9:00", "10:00", 8 * 60, openRoom);
    expect(result.status).toBe("available");
    const out = explainAvailability({
      roomName: "T-OPEN",
      start: "9:00",
      end: "10:00",
      result,
    });
    expect(out.ok).toBe(true);
    if (out.ok) {
      expect(out.explanation).toContain("9:00");
      expect(out.explanation).toContain("10:00");
    }
  });

  it("rejects a malformed result object", () => {
    const out = explainAvailability({
      ...availableInput(),
      result: { status: 42 } as unknown as ExplanationInput["result"],
    });
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.error).toContain("malformed");
  });

  it("rejects an unavailable result without reason codes", () => {
    const bad = unavailableInput();
    const input: ExplanationInput = {
      ...bad,
      result: { status: "unavailable", reasons: ["x"], codes: [] },
    };
    const out = explainAvailability(input);
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.error).toContain("reason code");
  });

  it("rejects an unknown reason code", () => {
    const input: ExplanationInput = {
      ...unavailableInput(),
      result: {
        status: "unavailable",
        reasons: ["x"],
        codes: ["not_a_code" as never],
      },
    };
    const out = explainAvailability(input);
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.error).toContain("Unknown reason code");
  });
});

// Output contract: polite, short, grounded in supplied facts only.
describe("explainAvailability — output", () => {
  it("produces an explanation for an available slot naming room and times", () => {
    const out = explainAvailability(availableInput());
    expect(out.ok).toBe(true);
    if (out.ok) {
      expect(out.explanation).toContain("T-OPEN");
      expect(out.explanation).toContain("12:00");
      expect(out.explanation).toContain("13:00");
      expect(out.explanation).toContain("can go ahead");
      expect(out.explanation.length).toBeLessThanOrEqual(600);
    }
  });

  it("explains every reason code without inventing facts", () => {
    const out = explainAvailability(unavailableInput());
    expect(out.ok).toBe(true);
    if (out.ok) {
      expect(out.explanation).toContain("overlaps an existing booking");
      expect(out.explanation).toContain("try again");
    }
  });

  it("mentions the blocked-room rule for a blocked room", () => {
    const blocked: Room = { ...openRoom, isBlocked: true };
    const result = checkAvailability("12:00", "13:00", NOW_9_00, blocked);
    const out = explainAvailability({ roomName: "T-OPEN", start: "12:00", end: "13:00", result });
    expect(out.ok).toBe(true);
    if (out.ok) expect(out.explanation).toContain("blocked");
  });

  it("joins multiple reason codes into one readable sentence", () => {
    const result = checkAvailability("25:00", "09:00", NOW_9_00, openRoom);
    expect(result.status).toBe("unavailable");
    if (result.status === "unavailable") {
      expect(result.codes.length).toBeGreaterThan(1);
      const out = explainAvailability({
        roomName: "T-OPEN",
        start: "25:00",
        end: "09:00",
        result,
      });
      expect(out.ok).toBe(true);
      if (out.ok) expect(out.explanation).toContain(" and ");
    }
  });
});

// The checker stays authoritative: codes must accompany every rejection path.
describe("checker reason codes stay in sync with rejection reasons", () => {
  it("every unavailable result carries at least one code", () => {
    const cases: Array<[string, string, number]> = [
      ["", "", NOW_9_00],
      ["abc", "10:00", NOW_9_00],
      ["08:00", "09:00", NOW_9_00],
      ["10:30", "11:30", NOW_9_00],
      ["12:00", "11:00", NOW_9_00],
      ["12:00", "15:00", NOW_9_00],
    ];
    for (const [start, end, now] of cases) {
      const res = checkAvailability(start, end, now, openRoom);
      if (res.status === "unavailable") {
        expect(res.reasons.length).toBe(res.codes.length);
        expect(res.codes.length).toBeGreaterThan(0);
      }
    }
  });
});
