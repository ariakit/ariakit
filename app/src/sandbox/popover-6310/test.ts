// See https://github.com/ariakit/ariakit/issues/6310
import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("reopened portaled popover focuses the first focusable element when a hidden element comes first", async () => {
  // First open: focus lands on the visible button, skipping the hidden file
  // input that comes before it in the DOM.
  await click(q.button("Attachments"));
  expect(q.dialog("Attachments")).toBeVisible();
  expect(q.button("Choose file")).toHaveFocus();

  // Closing via the disclosure moves focus out of the portal, which disables
  // focus inside it and leaves "Choose file" with tabindex="-1". The click
  // helper's dwell between mousedown and mouseup lets the disable run while the
  // popover is still visible, like a real click's gap.
  await click(q.button("Attachments"));
  // Wait for the close to settle: focus returns to the disclosure once the
  // popover hides.
  await expect.poll(q.button.lazy("Attachments")).toHaveFocus();
  // Guard the bug precondition: the reopen only exercises the broken fallback
  // when no element inside is tabbable, so confirm the disable actually ran.
  expect(q.button.hidden("Choose file")).toHaveAttribute("tabindex", "-1");

  // Reopening must move focus to the visible button again. Before the fix, focus
  // stayed on the disclosure because the focusable fallback resolved to the
  // hidden file input and focusing it is a no-op.
  await click(q.button("Attachments"));
  expect(q.dialog("Attachments")).toBeVisible();
  expect(q.button("Choose file")).toHaveFocus();
});
