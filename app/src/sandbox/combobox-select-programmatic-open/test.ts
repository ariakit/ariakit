import { click, press, q, sleep } from "@ariakit/test";
import { expect, test } from "vitest";

// The scroll side of the presentation is browser-only and lives in
// test-browser.ts.
// https://github.com/ariakit/ariakit/issues/7068
test("takes focus when opened without focus", async () => {
  expect(document.body).toHaveFocus();

  await press("F2");

  expect(q.listbox()).toBeVisible();
  expect(q.combobox("Vegetable")).toHaveFocus();
});

// Focus is asserted only at the end, so the registration assertion above it
// still runs against the unfixed behavior instead of being skipped by an
// earlier failure.
// https://github.com/ariakit/ariakit/issues/7068
test("keeps focus while options arrive after the open", async () => {
  await press("F2");
  expect(q.listbox()).toBeVisible();
  // Pins that Onion registers after the open instead of being there all along,
  // which is the whole point of this test.
  expect(q.option.maybe("Onion")).not.toBeInTheDocument();

  await click(q.button("Load all vegetables"));

  await expect.poll(q.option.lazy("Onion")).toHaveAttribute("data-active-item");
  expect(q.combobox("Vegetable")).toHaveFocus();
});

// A programmatic open is the app deciding to show the popup, so it takes focus
// like an interactive one instead of deferring to whoever held it.
// https://github.com/ariakit/ariakit/issues/7068
test("takes focus even when another element owns it", async () => {
  const note = q.textbox("Note");
  await click(note);
  expect(note).toHaveFocus();

  await press("F2");

  expect(q.listbox()).toBeVisible();
  expect(q.combobox("Vegetable")).toHaveFocus();
});

// The select is the only control for this popup, so it stays the element that
// announces the open state no matter who held focus when the open happened.
// https://github.com/ariakit/ariakit/issues/7080
test("announces the select as expanded when another element owns focus", async () => {
  const select = q.combobox("Vegetable");
  const note = q.textbox("Note");
  await click(note);
  expect(note).toHaveFocus();
  expect(select).toHaveAttribute("aria-expanded", "false");

  await press("F2");

  expect(q.listbox()).toBeVisible();
  expect(select).toHaveAttribute("aria-expanded", "true");
});

// https://github.com/ariakit/ariakit/issues/7068
test("abandons the presentation when focus leaves before the options arrive", async () => {
  await press("F2");
  expect(q.combobox("Vegetable")).toHaveFocus();
  // The presentation is still waiting for its target, which is what makes the
  // focus move below an abandonment rather than a no-op.
  expect(q.option.maybe("Onion")).not.toBeInTheDocument();

  const note = q.textbox("Note");
  await click(note);
  await click(q.button("Load all vegetables"));

  await expect.poll(q.option.lazy("Onion")).toHaveAttribute("data-active-item");
  expect(q.listbox()).toBeVisible();

  // An abandoned presentation has no positive state for its cancellation, so
  // cross the registration's checkpoint before sampling.
  await sleep();
  expect(note).toHaveFocus();
});
