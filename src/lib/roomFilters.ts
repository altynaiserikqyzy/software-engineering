import type { Room, FilterCriteria } from "@/lib/types";

// F1: capacity must be >= requested attendees.
// F2: room must contain all required equipment.
// F3: blocked rooms are always excluded from the filtered set.
export function filterRooms(
  rooms: readonly Room[],
  criteria: FilterCriteria,
): Room[] {
  return rooms.filter((room) => matchesFilters(room, criteria));
}

// Checks whether a room satisfies all filter criteria (including blocked).
// Used to determine whether a room was filtered out vs. failed availability.
export function matchesFilters(room: Room, criteria: FilterCriteria): boolean {
  if (room.isBlocked) return false;
  if (room.capacity < criteria.attendees) return false;
  const required = new Set(criteria.requiredEquipment);
  if (required.size > 0) {
    const roomEq = new Set(room.equipment);
    for (const item of required) {
      if (!roomEq.has(item)) return false;
    }
  }
  return true;
}
