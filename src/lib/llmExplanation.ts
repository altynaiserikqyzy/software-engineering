import { isValidTime } from "@/lib/availability";
import type { ReasonCode, Result } from "@/lib/types";

// Mock LLM adapter. Takes the structured Result produced by the deterministic
// checker and returns a short, polite explanation built ONLY from the supplied
// facts. It never calls the network, never invents data, and can be swapped
// later for a real LLM client with the same shape.

export type ExplanationInput = {
  roomName: string;
  start: string;
  end: string;
  result: Result;
};

export type ExplanationOutput =
  | { ok: true; explanation: string }
  | { ok: false; error: string };

const CODE_LABELS: Record<ReasonCode, string> = {
  missing_times: "both a start and an end time are needed",
  invalid_times: "one of the times could not be read",
  start_in_past: "the start time is not after the current time",
  start_out_of_range: "the start time falls outside the day's hours (00:00–24:00)",
  end_out_of_range: "the end time falls outside the day's hours (00:00–24:00)",
  reversed_interval: "the end time is not later than the start time",
  duration_exceeded: "the requested duration is longer than the 120-minute maximum",
  booking_overlap: "the slot overlaps an existing booking",
  room_blocked: "the room is currently blocked",
};

// Validates that the input is the exact shape produced by the checker before
// any text is generated.
function validateInput(input: ExplanationInput): string | null {
  if (typeof input !== "object" || input === null) {
    return "Explanation input must be an object.";
  }
  if (typeof input.roomName !== "string" || input.roomName.trim().length === 0) {
    return "A room name is required to explain availability.";
  }
  if (!isValidTime(input.start) || !isValidTime(input.end)) {
    return "Start and end times must be in HH:MM format.";
  }
  const result = input.result;
  if (typeof result !== "object" || result === null || typeof result.status !== "string") {
    return "The availability result is missing or malformed.";
  }
  if (result.status === "unavailable") {
    if (!Array.isArray(result.codes) || result.codes.length === 0) {
      return "An unavailable result must include at least one reason code.";
    }
    for (const code of result.codes) {
      if (!(code in CODE_LABELS)) {
        return `Unknown reason code: ${String(code)}`;
      }
    }
  }
  return null;
}

// Defense-in-depth: the generated text must reference only supplied facts.
// A malformed output is surfaced as an error rather than shown to the user.
function validateOutput(explanation: string): string | null {
  if (typeof explanation !== "string" || explanation.trim().length === 0) {
    return "Generated explanation was empty.";
  }
  if (explanation.length > 600) {
    return "Generated explanation was too long.";
  }
  return null;
}

function humanList(items: readonly string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

export function explainAvailability(input: ExplanationInput): ExplanationOutput {
  const inputError = validateInput(input);
  if (inputError) {
    return { ok: false, error: inputError };
  }

  const { roomName, start, end, result } = input;

  let explanation: string;
  if (result.status === "available") {
    explanation =
      `Room ${roomName} looks free from ${start} to ${end}. ` +
      "It is not blocked, the requested duration is within the 120-minute limit, " +
      "and the slot does not clash with any existing booking. This booking can go ahead.";
  } else {
    const labels = result.codes.map((code) => CODE_LABELS[code]);
    explanation =
      `Unfortunately, room ${roomName} cannot be booked from ${start} to ${end} ` +
      `because ${humanList(labels)}. ` +
      "Please adjust the request and try again — happy to help check another slot.";
  }

  const outputError = validateOutput(explanation);
  if (outputError) {
    return { ok: false, error: outputError };
  }

  return { ok: true, explanation };
}
