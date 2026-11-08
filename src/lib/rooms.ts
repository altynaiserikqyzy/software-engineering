import type { Room } from "@/lib/availability";

// Fictional room data defined in source code.
// To change a room's blocked status or bookings, edit this array directly.
// The `as const` + `Readonly<Room[]>` guards prevent runtime mutation of
// booking fixtures, satisfying the "do not mutate booking fixtures" constraint.
export const ROOMS: readonly Room[] = [
  {
    id: "a-101",
    name: "A-101",
    building: "Engineering Building",
    floor: 1,
    capacity: 30,
    equipment: ["Projector", "Whiteboard", "Audio System"],
    isBlocked: false,
    bookings: [
      { id: "b1", start: "09:00", end: "10:00", bookedBy: "Dr. Patel", purpose: "Faculty meeting" },
      { id: "b2", start: "11:30", end: "12:30", bookedBy: "CS Club", purpose: "Project review" },
      { id: "b3", start: "14:00", end: "15:30", bookedBy: "Admin Office", purpose: "Open house prep" },
      { id: "b4", start: "17:00", end: "18:00", bookedBy: "Tutoring Team", purpose: "Calculus tutoring" },
    ],
  },
  {
    id: "a-102",
    name: "A-102",
    building: "Engineering Building",
    floor: 1,
    capacity: 20,
    equipment: ["Whiteboard"],
    isBlocked: true,
    bookings: [
      { id: "b5", start: "10:00", end: "11:00", bookedBy: "Maintenance", purpose: "HVAC repair" },
      { id: "b6", start: "13:00", end: "14:00", bookedBy: "Facilities", purpose: "Inspection" },
    ],
  },
  {
    id: "b-201",
    name: "B-201",
    building: "Science Building",
    floor: 2,
    capacity: 40,
    equipment: ["Projector", "Video Conferencing", "Smartboard", "Audio System"],
    isBlocked: false,
    bookings: [
      { id: "b7", start: "08:30", end: "09:30", bookedBy: "Chem Dept", purpose: "Lab prep" },
      { id: "b8", start: "16:00", end: "17:00", bookedBy: "Study Group", purpose: "Review session" },
    ],
  },
  {
    id: "c-305",
    name: "C-305",
    building: "Library Building",
    floor: 3,
    capacity: 12,
    equipment: ["Whiteboard", "Video Conferencing"],
    isBlocked: false,
    bookings: [
      { id: "b9", start: "10:00", end: "11:30", bookedBy: "Research Team", purpose: "Literature review" },
      { id: "b10", start: "15:00", end: "16:00", bookedBy: "Book Club", purpose: "Weekly meeting" },
    ],
  },
  {
    id: "d-110",
    name: "D-110",
    building: "Business Building",
    floor: 1,
    capacity: 50,
    equipment: ["Projector", "Audio System", "Video Conferencing"],
    isBlocked: false,
    bookings: [
      { id: "b11", start: "09:00", end: "10:30", bookedBy: "Career Services", purpose: "Resume workshop" },
      { id: "b12", start: "13:00", end: "14:30", bookedBy: "MBA Cohort", purpose: "Case study" },
      { id: "b13", start: "16:00", end: "17:30", bookedBy: "Alumni Office", purpose: "Networking prep" },
    ],
  },
];
