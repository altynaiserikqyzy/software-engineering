import { CheckCircle2, XCircle, ShieldAlert } from "lucide-react";
import type { Result } from "@/lib/types";

type AvailabilityResultProps = {
  result: Result;
};

export function AvailabilityResult({ result }: AvailabilityResultProps) {
  return (
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
  );
}
