import { Clock, Info } from "lucide-react";
import type { Room } from "@/lib/types";

type BookingsListProps = {
  room: Room | null;
};

export function BookingsList({ room }: BookingsListProps) {
  const bookings = room?.bookings ?? [];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      {room ? (
        <>
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
        </>
      ) : (
        <div className="py-8 text-center">
          <p className="text-sm text-slate-400">Select a room to view its bookings.</p>
        </div>
      )}
    </div>
  );
}
