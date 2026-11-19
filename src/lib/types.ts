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
  | { status: "available"; summary: string }
  | { status: "unavailable"; reasons: string[]; codes: ReasonCode[] };

// Stable machine-readable identifiers for each unavailability rule. The mock
// LLM adapter consumes these instead of parsing human-readable reason text.
export type ReasonCode =
  | "missing_times"
  | "invalid_times"
  | "start_in_past"
  | "start_out_of_range"
  | "end_out_of_range"
  | "reversed_interval"
  | "duration_exceeded"
  | "booking_overlap"
  | "room_blocked";
