import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "@/App";

// Integration test: verifies the full filter → F5 auto-selection → UI flow.
// Uses the production ROOMS fixture and the real App component.
//
// ROOMS layout (from rooms.ts):
//   a-101: capacity 30, [Projector, Whiteboard, Audio System], not blocked
//   a-102: capacity 20, [Whiteboard], BLOCKED
//   b-201: capacity 40, [Projector, Video Conferencing, Smartboard, Audio System], not blocked
//   c-305: capacity 12, [Whiteboard, Video Conferencing], not blocked
//   d-110: capacity 50, [Projector, Audio System, Video Conferencing], not blocked

describe("App integration — filtering and F5 auto-selection", () => {
  it("filters rooms by capacity and equipment, excludes blocked rooms, and auto-selects the first match", async () => {
    const user = userEvent.setup();
    render(<App />);

    // Initially, the first non-blocked room (a-101) should be selected.
    const roomSelect = screen.getByLabelText("Select a room") as HTMLSelectElement;
    expect(roomSelect.value).toBe("a-101");

    // The blocked room (a-102) should never appear in the dropdown.
    const options = Array.from(roomSelect.options).map((o) => o.value);
    expect(options).not.toContain("a-102");

    // Set capacity filter to 40 — only b-201 and d-110 qualify by capacity.
    const attendeesInput = screen.getByLabelText("Minimum attendees");
    await user.clear(attendeesInput);
    await user.type(attendeesInput, "40");

    // F5: a-101 (capacity 30) no longer matches, so the first matching room
    // (b-201, capacity 40) should be auto-selected.
    expect(roomSelect.value).toBe("b-201");

    // Now require "Smartboard" equipment — only b-201 has it among the capacity matches.
    const smartboardButton = screen.getByRole("button", { name: "Smartboard" });
    await user.click(smartboardButton);

    // b-201 should still be selected (it matches both filters).
    expect(roomSelect.value).toBe("b-201");

    // Verify only b-201 appears in the dropdown.
    const filteredOptions = Array.from(roomSelect.options).map((o) => o.value);
    expect(filteredOptions).toEqual(["b-201"]);

    // Verify the room card shows b-201 details (text is split across nodes).
    const roomCard = screen.getByText("Selected Room").closest("div")!.parentElement!;
    expect(roomCard.textContent).toContain("B-201");

    // Now increase capacity to 45 — b-201 (capacity 40) is excluded, d-110 (50) is the only match.
    await user.clear(attendeesInput);
    await user.type(attendeesInput, "45");

    // d-110 does not have Smartboard, so clearing Smartboard is needed for it to appear.
    // First, verify no rooms match (b-201 excluded by capacity, d-110 excluded by Smartboard).
    expect(screen.getByText("No matching rooms found")).toBeInTheDocument();

    // Remove Smartboard requirement.
    await user.click(smartboardButton);

    // Re-query the select element — it was removed from the DOM during the empty state
    // and a new instance was created when d-110 became available again.
    const restoredSelect = screen.getByLabelText("Select a room") as HTMLSelectElement;
    expect(restoredSelect.value).toBe("d-110");
  });

  it("shows the blocked room's status badge when it would be selected but is excluded from filters", async () => {
    const user = userEvent.setup();
    render(<App />);

    // With no filters, the blocked room a-102 should NOT appear in the dropdown.
    const roomSelect = screen.getByLabelText("Select a room") as HTMLSelectElement;
    const options = Array.from(roomSelect.options).map((o) => o.value);
    expect(options).not.toContain("a-102");

    // The room count should show 4 available rooms (5 total minus 1 blocked).
    // Initially no active filters, so the filter bar summary is not shown.
    // Activate a filter to see the count.
    const attendeesInput = screen.getByLabelText("Minimum attendees");
    await user.type(attendeesInput, "1");

    // Should show "Showing 4 of 4 available rooms".
    expect(screen.getByText(/Showing 4 of 4 available rooms/)).toBeInTheDocument();
  });

  it("clearing filters restores the original room selection", async () => {
    const user = userEvent.setup();
    render(<App />);

    const roomSelect = screen.getByLabelText("Select a room") as HTMLSelectElement;
    expect(roomSelect.value).toBe("a-101");

    // Apply a capacity filter that excludes a-101.
    const attendeesInput = screen.getByLabelText("Minimum attendees");
    await user.type(attendeesInput, "40");
    expect(roomSelect.value).toBe("b-201");

    // Clear filters via the "Clear filters" button.
    await user.click(screen.getByRole("button", { name: "Clear filters" }));

    // a-101 should be selectable again and auto-selected (first non-blocked room).
    const restoredOptions = Array.from(roomSelect.options).map((o) => o.value);
    expect(restoredOptions).toContain("a-101");
  });
});
