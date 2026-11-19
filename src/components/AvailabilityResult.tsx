import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, ShieldAlert, MessageSquareText, Sparkles } from "lucide-react";
import type { Result } from "@/lib/types";
import { explainAvailability } from "@/lib/llmExplanation";

type AvailabilityResultProps = {
  result: Result;
  roomName: string;
  start: string;
  end: string;
};

export function AvailabilityResult({ result, roomName, start, end }: AvailabilityResultProps) {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [explanationError, setExplanationError] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);

  // Clear any stale explanation when the verdict changes so a new check never
  // shows an explanation produced for the previous result.
  useEffect(() => {
    setExplanation(null);
    setExplanationError(null);
  }, [result]);

  const handleExplain = () => {
    setIsExplaining(true);
    setExplanationError(null);
    // The mock adapter is synchronous, but the flow is kept promise-shaped so a
    // real async LLM client can drop in without UI changes.
    Promise.resolve()
      .then(() => explainAvailability({ roomName, start, end, result }))
      .then((out) => {
        if (out.ok) {
          setExplanation(out.explanation);
        } else {
          setExplanation(null);
          setExplanationError(out.error);
        }
      })
      .catch(() => {
        setExplanation(null);
        setExplanationError("Could not generate an explanation right now. Please try again.");
      })
      .finally(() => setIsExplaining(false));
  };

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
            <p className="text-sm text-emerald-700 mt-1">{result.summary}</p>
          )}

          <div className="mt-3">
            <button
              type="button"
              onClick={handleExplain}
              disabled={isExplaining}
              className="inline-flex items-center gap-2 text-sm font-medium rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed text-slate-700 px-3.5 py-2 transition-colors"
            >
              {isExplaining ? (
                <Sparkles className="w-4 h-4 animate-pulse text-teal-600" />
              ) : (
                <MessageSquareText className="w-4 h-4 text-teal-600" />
              )}
              {isExplaining ? "Preparing explanation…" : "Explain availability"}
            </button>
          </div>

          {explanation && (
            <div className="mt-3 rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-teal-600 mb-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Plain-language explanation
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">{explanation}</p>
            </div>
          )}

          {explanationError && (
            <p className="mt-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              {explanationError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
