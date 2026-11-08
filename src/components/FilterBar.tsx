import { Filter, Users } from "lucide-react";
import { EQUIPMENT_OPTIONS } from "@/lib/availability";

type FilterBarProps = {
  attendees: string;
  requiredEquipment: string[];
  filteredCount: number;
  totalAvailable: number;
  hasActiveFilters: boolean;
  onAttendeesChange: (value: string) => void;
  onEquipmentToggle: (item: string) => void;
  onClear: () => void;
};

export function FilterBar({
  attendees,
  requiredEquipment,
  filteredCount,
  totalAvailable,
  hasActiveFilters,
  onAttendeesChange,
  onEquipmentToggle,
  onClear,
}: FilterBarProps) {
  return (
    <section className="mb-6 bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-4 h-4 text-teal-600" />
        <h2 className="font-semibold text-slate-900 text-sm uppercase tracking-wide">
          Room Filters
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* F1: Capacity filter */}
        <div>
          <label
            htmlFor="attendees"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Minimum attendees
          </label>
          <div className="relative">
            <Users className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="attendees"
              type="number"
              min="0"
              value={attendees}
              onChange={(e) => onAttendeesChange(e.target.value)}
              placeholder="Any"
              className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
        </div>

        {/* F2: Equipment filter */}
        <div>
          <span className="block text-sm font-medium text-slate-700 mb-1.5">
            Required equipment
          </span>
          <div className="flex flex-wrap gap-2">
            {EQUIPMENT_OPTIONS.map((item) => {
              const active = requiredEquipment.includes(item);
              return (
                <button
                  key={item}
                  onClick={() => onEquipmentToggle(item)}
                  className={`text-xs font-medium rounded-full px-3 py-1.5 border transition-colors ${
                    active
                      ? "bg-teal-600 text-white border-teal-600"
                      : "bg-white text-slate-600 border-slate-300 hover:border-teal-400"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Showing {filteredCount} of {totalAvailable} available rooms
          </p>
          <button
            onClick={onClear}
            className="text-xs font-medium text-teal-600 hover:text-teal-700"
          >
            Clear filters
          </button>
        </div>
      )}
    </section>
  );
}
