import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { AvailabilityResult } from "@/components/AvailabilityResult";
import type { Result } from "@/lib/types";

const availableResult: Result = {
  status: "available",
  summary: "This room is free from 12:00 to 13:00 — it fits within the 120-minute limit, does not overlap any existing booking, and the room is not blocked.",
};

const unavailableResult: Result = {
  status: "unavailable",
  reasons: ["Overlaps with an existing booking (10:00–11:00, Block A)."],
  codes: ["booking_overlap"],
};

describe("AvailabilityResult — stale explanation reset", () => {
  it("clears a previously shown explanation when the result prop changes", async () => {
    const { rerender } = render(
      <AvailabilityResult result={availableResult} roomName="T-OPEN" start="12:00" end="13:00" />,
    );

    // Generate an explanation for the available verdict.
    const button = screen.getByRole("button", { name: "Explain availability" });
    await act(async () => {
      fireEvent.click(button);
    });
    expect(screen.getByText("Plain-language explanation")).toBeInTheDocument();
    expect(screen.getByText(/can go ahead/)).toBeInTheDocument();

    // Re-check produces a new (unavailable) verdict on the same component instance.
    rerender(
      <AvailabilityResult result={unavailableResult} roomName="T-OPEN" start="10:30" end="11:30" />,
    );

    // The stale "can go ahead" explanation must be gone.
    expect(screen.queryByText("Plain-language explanation")).not.toBeInTheDocument();
    expect(screen.queryByText(/can go ahead/)).not.toBeInTheDocument();
    // The new verdict is shown.
    expect(screen.getByText("Unavailable — booking request rejected")).toBeInTheDocument();
  });
});
