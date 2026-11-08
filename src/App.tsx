import { useEffect, useState } from "react";
import { Sparkles, SearchX } from "lucide-react";
import { checkAvailability } from "@/lib/availability";
import type { Result } from "@/lib/types";
import { filterRooms, matchesFilters } from "@/lib/roomFilters";
import { ROOMS } from "@/lib/rooms";
import { FilterBar } from "@/components/FilterBar";
import { BookingForm } from "@/components/BookingForm";
import { AvailabilityResult } from "@/components/AvailabilityResult";
import { BookingsList } from "@/components/BookingsList";

export default function App() {
  const [selectedRoomId, setSelectedRoomId] = useState<string>(ROOMS[0].id);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  // Filter state (F1–F3).
  const [attendees, setAttendees] = useState("");
  const [requiredEquipment, setRequiredEquipment] = useState<string[]>([]);

  // Live current time for display. Updates every second and is cleaned up on unmount.
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

  const nowLabel = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const todayLabel = now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });

  // Derived filtered rooms (F1–F3).
  const attendeesNum = attendees ? Number(attendees) : 0;
  const criteria = { attendees: attendeesNum, requiredEquipment };
  const filteredRooms = filterRooms(ROOMS, criteria);
  const totalAvailable = ROOMS.filter((r) => !r.isBlocked).length;
  const hasActiveFilters = attendeesNum > 0 || requiredEquipment.length > 0;

  // F5: Auto-select the first matching room when the current selection no longer
  // satisfies the filters. Uses useEffect instead of calling setState during render.
  useEffect(() => {
    const selected = ROOMS.find((r) => r.id === selectedRoomId);
    const stillMatches = selected
      ? matchesFilters(selected, { attendees: attendeesNum, requiredEquipment })
      : false;
    if (!stillMatches && filteredRooms.length > 0) {
      setSelectedRoomId(filteredRooms[0].id);
    }
  }, [filteredRooms, selectedRoomId, attendeesNum, requiredEquipment]);

  const room = ROOMS.find((r) => r.id === selectedRoomId) ?? null;
  const selectedRoomInFiltered = room ? filteredRooms.some((r) => r.id === room.id) : false;
  const effectiveRoom = selectedRoomInFiltered ? room : filteredRooms.length > 0 ? filteredRooms[0] : null;

  const handleRoomChange = (id: string) => {
    setSelectedRoomId(id);
    setResult(null);
  };

  const handleEquipmentToggle = (item: string) => {
    setRequiredEquipment((prev) =>
      prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item],
    );
    setResult(null);
  };

  const handleCheck = () => {
    if (!effectiveRoom) return;
    const checkNow = new Date();
    const checkNowMin = checkNow.getHours() * 60 + checkNow.getMinutes();
    const res = checkAvailability(start, end, checkNowMin, effectiveRoom);
    setResult(res);
  };

  const handleReset = () => {
    setStart("");
    setEnd("");
    setResult(null);
  };

  const handleFiltersReset = () => {
    setAttendees("");
    setRequiredEquipment([]);
    setResult(null);
  };

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
            Filter rooms by capacity and equipment, then check whether a room is free for a
            requested time slot. Availability is evaluated against existing bookings, campus rules,
            and the room's current status.
          </p>
        </header>

        <FilterBar
          attendees={attendees}
          requiredEquipment={requiredEquipment}
          filteredCount={filteredRooms.length}
          totalAvailable={totalAvailable}
          hasActiveFilters={hasActiveFilters}
          onAttendeesChange={(value) => {
            setAttendees(value);
            setResult(null);
          }}
          onEquipmentToggle={handleEquipmentToggle}
          onClear={handleFiltersReset}
        />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Room card + booking form */}
          <section className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
            {effectiveRoom ? (
              <>
                <BookingForm
                  room={effectiveRoom}
                  filteredRooms={filteredRooms}
                  start={start}
                  end={end}
                  nowLabel={nowLabel}
                  todayLabel={todayLabel}
                  onRoomChange={handleRoomChange}
                  onStartChange={(value) => {
                    setStart(value);
                    setResult(null);
                  }}
                  onEndChange={(value) => {
                    setEnd(value);
                    setResult(null);
                  }}
                  onCheck={handleCheck}
                  onReset={handleReset}
                />
                {result && <AvailabilityResult result={result} />}
              </>
            ) : (
              /* F4: Empty state — no rooms match the active filters. */
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <SearchX className="w-12 h-12 text-slate-300 mb-4" />
                <h3 className="text-lg font-semibold text-slate-700">No matching rooms found</h3>
                <p className="mt-2 text-sm text-slate-500 max-w-sm">
                  No rooms match your current filters. Try reducing the minimum attendees or removing
                  required equipment.
                </p>
                <button
                  onClick={handleFiltersReset}
                  className="mt-4 text-sm font-medium text-teal-600 hover:text-teal-700"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </section>

          {/* Right: Existing bookings + rules */}
          <aside className="lg:col-span-2 space-y-6">
            <BookingsList room={effectiveRoom} />

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
