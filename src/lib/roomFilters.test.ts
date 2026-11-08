import { describe, it, expect } from "vitest";
import { filterRooms, matchesFilters } from "@/lib/roomFilters";
import { type Room } from "@/lib/types";

// Small catalog for filter tests.
const openRoom: Room = {
  id: "t-open",
  name: "T-OPEN",
  building: "Test Building",
  floor: 1,
  capacity: 20,
  equipment: ["Projector", "Whiteboard"],
  isBlocked: false,
  bookings: [],
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

const filterRoomsFixture: readonly Room[] = [
  { ...openRoom, id: "f1", name: "F1", capacity: 10, equipment: ["Whiteboard"] },
  { ...openRoom, id: "f2", name: "F2", capacity: 30, equipment: ["Projector", "Video Conferencing"] },
  { ...openRoom, id: "f3", name: "F3", capacity: 50, equipment: ["Projector", "Smartboard", "Audio System"] },
  { ...blockedRoom, id: "f4", name: "F4", capacity: 40, equipment: ["Projector", "Whiteboard"] },
];

// F1: capacity must be >= requested attendees.
describe("F1 — capacity filter", () => {
  it("returns rooms that meet or exceed the requested capacity", () => {
    const res = filterRooms(filterRoomsFixture, { attendees: 25, requiredEquipment: [] });
    expect(res.map((r) => r.id)).toEqual(["f2", "f3"]);
  });

  it("returns all non-blocked rooms when attendees is 0", () => {
    const res = filterRooms(filterRoomsFixture, { attendees: 0, requiredEquipment: [] });
    expect(res.map((r) => r.id)).toEqual(["f1", "f2", "f3"]);
  });

  it("matchesFilters returns false for a room below the capacity", () => {
    expect(matchesFilters(filterRoomsFixture[0], { attendees: 15, requiredEquipment: [] })).toBe(false);
  });

  // Boundary: exact capacity must be accepted (room.capacity == attendees).
  it("accepts a room whose capacity exactly equals the requested attendees", () => {
    // f2 has capacity 30; requesting exactly 30 should match.
    expect(matchesFilters(filterRoomsFixture[1], { attendees: 30, requiredEquipment: [] })).toBe(true);
    const res = filterRooms(filterRoomsFixture, { attendees: 30, requiredEquipment: [] });
    expect(res.map((r) => r.id)).toContain("f2");
  });

  // Boundary: one above capacity must be rejected.
  it("rejects a room whose capacity is one below the requested attendees", () => {
    // f2 has capacity 30; requesting 31 should not match.
    expect(matchesFilters(filterRoomsFixture[1], { attendees: 31, requiredEquipment: [] })).toBe(false);
  });
});

// F2: room must contain all required equipment.
describe("F2 — equipment filter", () => {
  it("returns only rooms that have all required equipment", () => {
    const res = filterRooms(filterRoomsFixture, {
      attendees: 0,
      requiredEquipment: ["Projector", "Audio System"],
    });
    expect(res.map((r) => r.id)).toEqual(["f3"]);
  });

  it("returns all non-blocked rooms when no equipment is required", () => {
    const res = filterRooms(filterRoomsFixture, { attendees: 0, requiredEquipment: [] });
    expect(res).toHaveLength(3);
  });

  it("excludes a room missing one of multiple required items", () => {
    expect(
      matchesFilters(filterRoomsFixture[1], {
        attendees: 0,
        requiredEquipment: ["Projector", "Smartboard"],
      }),
    ).toBe(false);
  });
});

// F3: blocked rooms are always excluded from the filtered set.
describe("F3 — blocked rooms excluded", () => {
  it("never returns a blocked room even if capacity and equipment match", () => {
    const res = filterRooms(filterRoomsFixture, {
      attendees: 35,
      requiredEquipment: ["Projector", "Whiteboard"],
    });
    expect(res.find((r) => r.id === "f4")).toBeUndefined();
  });

  it("matchesFilters returns false for a blocked room", () => {
    expect(matchesFilters(filterRoomsFixture[3], { attendees: 0, requiredEquipment: [] })).toBe(false);
  });
});

// F4: empty state — when no rooms match, filterRooms returns an empty array.
describe("F4 — empty result when no rooms match", () => {
  it("returns an empty array when no room satisfies the criteria", () => {
    const res = filterRooms(filterRoomsFixture, {
      attendees: 100,
      requiredEquipment: [],
    });
    expect(res).toEqual([]);
  });

  it("returns an empty array when required equipment no room has", () => {
    const res = filterRooms(filterRoomsFixture, {
      attendees: 0,
      requiredEquipment: ["Nonexistent Device"],
    });
    expect(res).toEqual([]);
  });
});

// Combined F1 + F2 + F3 intersection.
describe("F1+F2+F3 combined filtering", () => {
  it("intersects capacity, equipment, and blocked constraints", () => {
    const res = filterRooms(filterRoomsFixture, {
      attendees: 30,
      requiredEquipment: ["Projector"],
    });
    expect(res.map((r) => r.id)).toEqual(["f2", "f3"]);
  });
});
