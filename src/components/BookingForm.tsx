import {
  CheckCircle2,
  Clock,
  DoorClosed,
  CalendarRange,
  Lock,
  Users,
} from "lucide-react";
import { MAX_MINUTES, formatDuration, toMinutes } from "@/lib/availability";
import type { Room } from "@/lib/types";

type BookingFormProps = {
  room: Room;
  filteredRooms: readonly Room[];
  start: string;
  end: string;
  nowLabel: string;
  todayLabel: string;
  onRoomChange: (id: string) => void;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
  onCheck: () => void;
  onReset: () => void;
};

export function BookingForm({
  room,
  filteredRooms,
  start,
  end,
  nowLabel,
  todayLabel,
  onRoomChange,
  onStartChange,
  onEndChange,
  onCheck,
  onReset,
}: BookingFormProps) {
  const liveDuration = start && end ? toMinutes(end) - toMinutes(start) : null;

  return (
    <>
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
          {room.isBlocked ? (
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

      {/* Room details */}
      <div className="flex flex-wrap gap-4 mt-4 mb-6 text-sm">
        <div className="flex items-center gap-1.5 text-slate-600">
          <Users className="w-4 h-4 text-slate-400" />
          <span className="font-semibold text-slate-900">{room.capacity}</span> seats
        </div>
        {room.equipment.length > 0 && (
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="font-semibold text-slate-900">{room.equipment.join(", ")}</span>
          </div>
        )}
      </div>

      {/* Current time */}
      <div className="flex items-center gap-2 text-sm text-slate-600 mb-6 bg-slate-50 rounded-lg px-4 py-3">
        <Clock className="w-4 h-4 text-teal-600" />
        <span>
          Current time used for availability checks:{" "}
          <span className="font-semibold text-slate-900">{nowLabel}</span>
          <span className="text-slate-400"> · {todayLabel}</span>
        </span>
      </div>

      {/* Room selector — only filtered rooms appear (F5) */}
      <div className="mb-5">
        <label
          htmlFor="room-select"
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          Select a room
        </label>
        <select
          id="room-select"
          value={room.id}
          onChange={(e) => onRoomChange(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
        >
          {filteredRooms.map((r) => (
            <option key={r.id} value={r.id}>
              Room {r.name} — {r.building}, Floor {r.floor} · {r.capacity} seats
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
            onChange={(e) => onStartChange(e.target.value)}
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
            onChange={(e) => onEndChange(e.target.value)}
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
          onClick={onCheck}
          className="inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-semibold rounded-lg px-5 py-3 transition-colors"
        >
          <CheckCircle2 className="w-5 h-5" />
          Check Availability
        </button>
        <button
          onClick={onReset}
          className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-600 font-medium border border-slate-300 rounded-lg px-5 py-3 transition-colors"
        >
          Reset
        </button>
      </div>
    </>
  );
}
