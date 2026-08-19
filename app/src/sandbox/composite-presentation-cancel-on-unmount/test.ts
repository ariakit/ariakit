import { click, focus, press, q, sleep } from "@ariakit/test";
import { expect, test } from "vitest";

// `test-browser.ts` is authoritative for which dismissal strands a
// presentation. When the panel is dismissed in the same task that focused it,
// Chromium commits a batched unmount after the microtask the composite queued
// and a `flushSync` unmount before it, while the simulated events here commit
// both before that microtask, so those two dismissals are not split the same
// way. A dismissal in a later task behaves alike in both. The outcome asserted
// in both files is the same either way: nothing may move focus on its own
// after the panel is dismissed.
// https://github.com/ariakit/ariakit/issues/7024

/**
 * Reopens the panel, puts DOM focus on a plain button inside it, then loads the
 * recent files entry. Registering that item is the store update that would wake
 * a presentation the dismissed panel left behind, and focus being inside the
 * panel again is what lets that presentation move focus.
 */
async function loadRecentFilesWithFocusInside() {
  await click(q.button("Show shortcuts"));
  const editShortcuts = q.button("Edit shortcuts");
  await focus(editShortcuts);
  // Clicked through the DOM so the click doesn't move focus out of the panel.
  q.button("Load recent files").click();
  await sleep();
  expect(q.button("Recent files")).toBeVisible();
  return editShortcuts;
}

test("keeps focus after the panel is hidden in a later task", async () => {
  await focus(q.toolbar("Shortcuts"));
  await click(q.button("Hide shortcuts"));

  expect(await loadRecentFilesWithFocusInside()).toHaveFocus();
});

test("keeps focus after the panel is hidden by the handler that focused it", async () => {
  await click(q.button("Focus and hide shortcuts"));

  expect(await loadRecentFilesWithFocusInside()).toHaveFocus();
});

test("keeps focus after the panel is hidden synchronously", async () => {
  await click(q.button("Focus and hide shortcuts synchronously"));

  expect(await loadRecentFilesWithFocusInside()).toHaveFocus();
});

test("keeps focus after tabbing into a panel that hides itself", async () => {
  const arm = q.button("Hide shortcuts on focus");
  await click(arm);
  expect(arm).toHaveFocus();
  await press.Tab();
  expect(q.toolbar.maybe("Shortcuts")).not.toBeInTheDocument();

  expect(await loadRecentFilesWithFocusInside()).toHaveFocus();
});

// Refusing to present after the panel goes away must not outlive the panel
// itself. The scroll that discriminates in the browser is invisible here, so
// the move is driven from outside the panel instead, and the handoff it
// triggers is what proves the presentation ran: the entry takes focus and
// hands it back to the panel.
test("presents the active item when a move targets the reopened panel", async () => {
  await click(q.button("Focus and hide shortcuts synchronously"));
  await click(q.button("Show shortcuts"));
  await click(q.button("Load recent files"));
  expect(q.button("Recent files")).toHaveAttribute("data-active-item");

  await click(q.button("Highlight recent files"));

  expect(q.toolbar("Shortcuts")).toHaveFocus();
});
