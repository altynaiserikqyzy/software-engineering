import type { Booking, Room, Result } from "@/lib/types";

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
  if (!/^\d+:\d+$/.test(time)) return NaN;
  const [h, m] = time.split(":").map(Number);
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
        `Requested duration is ${formatDuration(duration)}, which exceeds the ${MAX_MINUTES}-minute maximum.`,
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
