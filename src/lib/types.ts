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
