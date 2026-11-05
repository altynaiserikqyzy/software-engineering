import { useEffect, useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  DoorClosed,
  CalendarRange,
  ShieldAlert,
  Sparkles,
  Info,
  Lock,
} from "lucide-react";
import {
  type Room,
  type Result,
  MAX_MINUTES,
  toMinutes,
  formatDuration,
  checkAvailability,
} from "@/lib/availability";

// Fictional room data defined in source code.
// To change a room's blocked status or bookings, edit this array directly.
const ROOMS: Room[] = [
  {
    id: "a-101",
    name: "A-101",
    building: "Engineering Building",
    floor: 1,
    blocked: false,
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
    blocked: true,
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
    blocked: false,
    bookings: [
      { id: "b7", start: "08:30", end: "09:30", bookedBy: "Chem Dept", purpose: "Lab prep" },
      { id: "b8", start: "16:00", end: "17:00", bookedBy: "Study Group", purpose: "Review session" },
    ],
  },
];

export default function App() {
  const [selectedRoomId, setSelectedRoomId] = useState<string>(ROOMS[0].id);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  // Live current time for display. Updates every second and is cleaned up on unmount.
  // This state is for the visible clock only — availability checks read a fresh
  // `new Date()` at the moment "Check Availability" is clicked, so validation is
  // never based on a timestamp captured at mount time.
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

  const nowLabel = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const todayLabel = now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });

  const room = ROOMS.find((r) => r.id === selectedRoomId) ?? ROOMS[0];
  const bookings = room.bookings;

  const handleRoomChange = (id: string) => {
    setSelectedRoomId(id);
    setResult(null);
  };

  const handleCheck = () => {
    // Read the current time fresh on every check — never reuse a memoized value.
    const checkNow = new Date();
    const checkNowMin = checkNow.getHours() * 60 + checkNow.getMinutes();
    const res = checkAvailability(start, end, checkNowMin, room);
    setResult(res);
  };

  const handleReset = () => {
    setStart("");
    setEnd("");
    setResult(null);
  };

  const liveDuration = start && end ? toMinutes(end) - toMinutes(start) : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Decorative top band */}
      <div className="h-2 bg-gradient-to-r from-sky-500 via-teal-500 to-emerald-500" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 text-teal-600 text-sm font-semibold mb-2">
            <Sparkles className="w-4 h-4" />
            Campus Resource Prototype
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            Smart Campus Room Availability Checker
          </h1>
          <p className="mt-2 text-slate-500 max-w-2xl">
            Check whether a room is free for a requested time slot. Availability is evaluated
            against existing bookings, campus rules, and the room's current status.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Room card + booking form */}
          <section className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
            {/* Room summary */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
                  <DoorClosed className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
                    Selected Room
                  </div>
                  <div className="text-xl font-bold text-slate-900">Room {room.name}</div>
                  <div className="text-sm text-slate-500">
                    {room.building} · Floor {room.floor}
                  </div>
                </div>
              </div>

              {/* Read-only status badge */}
              <div className="flex items-center gap-2">
                {room.blocked ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-100 border border-rose-200 rounded-full px-3 py-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    Blocked
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-100 border border-emerald-200 rounded-full px-3 py-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Available status
                  </span>
                )}
              </div>
            </div>

            {/* Current time */}
            <div className="flex items-center gap-2 text-sm text-slate-600 mt-6 mb-6 bg-slate-50 rounded-lg px-4 py-3">
              <Clock className="w-4 h-4 text-teal-600" />
              <span>
                Current time used for availability checks:{" "}
                <span className="font-semibold text-slate-900">{nowLabel}</span>
                <span className="text-slate-400"> · {todayLabel}</span>
              </span>
            </div>

            {/* Room selector */}
            <div className="mb-5">
              <label
                htmlFor="room-select"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Select a room
              </label>
              <select
                id="room-select"
                value={selectedRoomId}
                onChange={(e) => handleRoomChange(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                {ROOMS.map((r) => (
                  <option key={r.id} value={r.id}>
                    Room {r.name} — {r.building}, Floor {r.floor}
                    {r.blocked ? " (blocked)" : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Booking start time
                </label>
                <input
                  type="time"
                  value={start}
                  onChange={(e) => {
                    setStart(e.target.value);
                    setResult(null);
                  }}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Booking end time
                </label>
                <input
                  type="time"
                  value={end}
                  onChange={(e) => {
                    setEnd(e.target.value);
                    setResult(null);
                  }}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            </div>

            {liveDuration !== null && !Number.isNaN(liveDuration) && (
              <div className="mt-3 text-xs text-slate-500 flex items-center gap-1.5">
                <CalendarRange className="w-3.5 h-3.5" />
                Requested duration: {liveDuration > 0 ? formatDuration(liveDuration) : "—"}
                {liveDuration > MAX_MINUTES && (
                  <span className="text-rose-600 font-medium">(exceeds 120 min limit)</span>
                )}
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={handleCheck}
                className="inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-semibold rounded-lg px-5 py-3 transition-colors"
              >
                <CheckCircle2 className="w-5 h-5" />
                Check Availability
              </button>
              <button
                onClick={handleReset}
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-600 font-medium border border-slate-300 rounded-lg px-5 py-3 transition-colors"
              >
                Reset
              </button>
            </div>

            {/* Result */}
            {result && (
              <div
                className={`mt-6 rounded-xl border p-5 ${
                  result.status === "available"
                    ? "bg-emerald-50 border-emerald-200"
                    : "bg-rose-50 border-rose-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  {result.status === "available" ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-6 h-6 text-rose-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div
                      className={`text-lg font-bold ${
                        result.status === "available" ? "text-emerald-700" : "text-rose-700"
                      }`}
                    >
                      {result.status === "available"
                        ? "Available — this booking can proceed"
                        : "Unavailable — booking request rejected"}
                    </div>
                    {result.status === "unavailable" && (
                      <ul className="mt-2 space-y-1.5">
                        {result.reasons.map((r, i) => (
                          <li key={i} className="text-sm text-rose-700 flex items-start gap-2">
                            <ShieldAlert className="w-4 h-4 mt-0.5 flex-shrink-0 text-rose-500" />
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {result.status === "available" && (
                      <p className="text-sm text-emerald-700 mt-1">
                        The requested slot does not overlap any existing booking, is within 120
                        minutes, falls within today's hours, and the room is not blocked.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Right: Existing bookings + rules */}
          <aside className="lg:col-span-2 space-y-6">
            {/* Existing bookings */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-slate-900">
                  Existing bookings · Room {room.name}
                </h2>
                <span className="text-xs font-medium text-slate-400">
                  {bookings.length} scheduled
                </span>
              </div>
              {bookings.length === 0 ? (
                <p className="text-sm text-slate-400">No existing bookings for this room.</p>
              ) : (
                <ul className="space-y-3">
                  {bookings.map((b) => (
                    <li
                      key={b.id}
                      className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2.5"
                    >
                      <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-700 flex flex-col items-center justify-center text-[10px] font-semibold leading-none">
                        <Clock className="w-3.5 h-3.5 mb-0.5" />
                        {b.start.split(":")[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-slate-900">
                          {b.start} – {b.end}
                        </div>
                        <div className="text-xs text-slate-500 truncate">
                          {b.purpose} · {b.bookedBy}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-4 text-xs text-slate-400 flex items-start gap-1.5">
                <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                Bookings that touch at endpoints (e.g. 10:00 start after a 09:00–10:00 booking) are allowed.
              </p>
            </div>

            {/* Rules */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="font-semibold text-slate-900 mb-3">Booking rules</h2>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0" />
                  Start must be strictly later than the current time.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0" />
                  End must be later than start, both within 00:00–24:00.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0" />
                  Duration up to 120 minutes (exactly 120 is allowed).
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0" />
                  A blocked room is always unavailable.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0" />
                  Overlapping bookings are rejected; touching endpoints are fine.
                </li>
              </ul>
            </div>
          </aside>
        </div>

        <footer className="mt-10 text-center text-xs text-slate-400">
          Prototype uses fictional data · No bookings are actually created or stored.
        </footer>
      </div>
    </div>
  );
}
