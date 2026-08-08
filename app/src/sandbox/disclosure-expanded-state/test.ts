import { click, hover, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/issues/7083
test("announces the popover disclosure as expanded when another element owns focus", async () => {
  const share = q.button("Share");
  const note = q.textbox("Note");
  await click(note);
  expect(note).toHaveFocus();
  expect(share).toHaveAttribute("aria-expanded", "false");

  await press("F2");

  expect(q.dialog("Share note")).toBeVisible();
  expect(share).toHaveAttribute("aria-expanded", "true");

  // The collapse half of the round trip, so a trigger that stops depending on
  // the disclosure element cannot get there by announcing itself expanded
  // unconditionally.
  await click(q.button("Close share"));

  expect(q.dialog("Share note")).not.toBeInTheDocument();
  expect(share).toHaveAttribute("aria-expanded", "false");
  // Returning the user to where they were typing is the supported behavior for
  // an open that never passed through a trigger, so a fix must correct the
  // announced state without moving the disclosure element that decides this.
  expect(note).toHaveFocus();
});

// https://github.com/ariakit/ariakit/issues/7083
test("announces the dialog disclosure as expanded when another element owns focus", async () => {
  const settings = q.button("Settings");
  const note = q.textbox("Note");
  await click(note);
  expect(note).toHaveFocus();
  expect(settings).toHaveAttribute("aria-expanded", "false");

  await press("F4");

  expect(q.dialog("Settings")).toBeVisible();
  expect(settings).toHaveAttribute("aria-expanded", "true");
});

// https://github.com/ariakit/ariakit/issues/7083
test("announces the menu button as expanded when another element owns focus", async () => {
  const format = q.menuitem("Format");
  const note = q.textbox("Note");
  await click(note);
  expect(note).toHaveFocus();
  expect(format).toHaveAttribute("aria-expanded", "false");

  await press("F8");

  expect(q.menu("Format")).toBeVisible();
  expect(format).toHaveAttribute("aria-expanded", "true");
});

// https://github.com/ariakit/ariakit/issues/7083
test("announces the select as expanded when another element owns focus", async () => {
  const status = q.combobox("Status");
  const note = q.textbox("Note");
  await click(note);
  expect(note).toHaveFocus();
  expect(status).toHaveAttribute("aria-expanded", "false");

  await press("F9");

  expect(q.listbox()).toBeVisible();
  expect(status).toHaveAttribute("aria-expanded", "true");
});

// Both triggers control the same section, so there is no ownership order that
// leaves the other one telling the truth.
// https://github.com/ariakit/ariakit/issues/7083
test("announces every trigger that controls the same content", async () => {
  const header = q.button("Revision history");
  const footer = q.button("Toggle revision history");
  expect(header).toHaveAttribute("aria-expanded", "false");
  expect(footer).toHaveAttribute("aria-expanded", "false");

  await click(header);

  expect(q.text("Edited 3 times.")).toBeVisible();
  expect(header).toHaveAttribute("aria-expanded", "true");
  expect(footer).toHaveAttribute("aria-expanded", "true");
});

// Menubar triggers read each other's announced state off the DOM to decide
// whether hovering a sibling opens its menu, so a trigger that under-reports
// its own open menu takes that away from every sibling.
// The menu that was already open stays open, which is a separate defect in how
// a menubar menu decides to hide on hover, not in the announced state.
// https://github.com/ariakit/ariakit/issues/7086
// https://github.com/ariakit/ariakit/issues/7083
test("opens a sibling menu on hover after a programmatic open", async () => {
  // Tab to the note instead of clicking it. `hover` replays a mousemove on the
  // previously hovered element, and the note is the menu's disclosure element
  // here, which arms the approach polygon the open menu uses to keep the
  // pointer, swallowing the sibling's mousemove before it reaches React.
  await press.Tab();
  expect(q.textbox("Note")).toHaveFocus();

  await press("F8");
  expect(q.menu("Format")).toBeVisible();
  await hover(q.menuitem("Insert"));

  expect(q.menu("Insert")).toBeVisible();
});
