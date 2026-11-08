export type Booking = {
  readonly id: string;
  readonly start: string; // "HH:MM"
  readonly end: string; // "HH:MM"
  readonly bookedBy: string;
  readonly purpose: string;
};

export type Room = {
  readonly id: string;
  readonly name: string;
  readonly building: string;
  readonly floor: number;
  readonly capacity: number;
  readonly equipment: readonly string[];
  readonly isBlocked: boolean;
  readonly bookings: readonly Booking[];
};

export type FilterCriteria = {
  attendees: number;
  requiredEquipment: readonly string[];
};

export type Result =
  | { status: "available" }
  | { status: "unavailable"; reasons: string[] };

export const MAX_MINUTES = 120;
export const DAY_MINUTES = 24 * 60;
export const EQUIPMENT_OPTIONS = [
  "Projector",
  "Whiteboard",
  "Video Conferencing",
  "Smartboard",
  "Audio System",
] as const;

export function toMinutes(time: string): number {
  if (!time || !time.includes(":")) return NaN;
  const [h, m] = time.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return NaN;
  return h * 60 + m;
}

export function formatDuration(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
}

// Overlap: reject if start < otherEnd AND end > otherStart. Touching endpoints allowed.
export function overlapsWith(
  startMin: number,
  endMin: number,
  bookings: readonly Booking[],
): Booking | null {
  for (const b of bookings) {
    const bStart = toMinutes(b.start);
    const bEnd = toMinutes(b.end);
    if (Number.isNaN(bStart) || Number.isNaN(bEnd)) continue;
    if (startMin < bEnd && endMin > bStart) {
      return b;
    }
  }
  return null;
}

export function checkAvailability(
  start: string,
  end: string,
  nowMin: number,
  room: Room,
): Result {
  const reasons: string[] = [];

  if (room.isBlocked) {
    reasons.push("This room is currently blocked and cannot be booked.");
  }

  if (!start || !end) {
    return { status: "unavailable", reasons: ["Please enter both a start and end time."] };
  }

  const startMin = toMinutes(start);
  const endMin = toMinutes(end);

  if (Number.isNaN(startMin) || Number.isNaN(endMin)) {
    return { status: "unavailable", reasons: ["One or both times are not valid."] };
  }

  // Range / basic validity checks (AC5, AC1).
  let rangeValid = true;
  if (startMin < 0 || startMin > DAY_MINUTES) {
    reasons.push("Start time must be within the same day (00:00–24:00).");
    rangeValid = false;
  }
  if (endMin < 0 || endMin > DAY_MINUTES) {
    reasons.push("End time must be within the same day (00:00–24:00).");
    rangeValid = false;
  }
  if (endMin <= startMin) {
    reasons.push("End time must be later than the start time.");
    rangeValid = false;
  }
  if (startMin <= nowMin) {
    reasons.push("Start time must be strictly later than the current time.");
  }

  // Only evaluate duration and overlap when the time range is structurally valid.
  if (rangeValid) {
    const duration = endMin - startMin;
    if (duration > MAX_MINUTES) {
      reasons.push(
        `Requested duration is ${formatDuration(duration)}, which exceeds the 120-minute maximum.`,
      );
    }

    const overlap = overlapsWith(startMin, endMin, room.bookings);
    if (overlap) {
      reasons.push(
        `Overlaps with an existing booking (${overlap.start}–${overlap.end}, ${overlap.purpose}).`,
      );
    }
  }

  if (reasons.length > 0) {
    return { status: "unavailable", reasons };
  }
  return { status: "available" };
}

// F1: capacity must be >= requested attendees.
// F2: room must contain all required equipment.
// F3: blocked rooms are always excluded from the "available" filtered set.
export function filterRooms(
  rooms: readonly Room[],
  criteria: FilterCriteria,
): Room[] {
  const required = new Set(criteria.requiredEquipment);
  return rooms.filter((room) => {
    if (room.isBlocked) return false;
    if (room.capacity < criteria.attendees) return false;
    if (required.size > 0) {
      const roomEq = new Set(room.equipment);
      for (const item of required) {
        if (!roomEq.has(item)) return false;
      }
    }
    return true;
  });
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
