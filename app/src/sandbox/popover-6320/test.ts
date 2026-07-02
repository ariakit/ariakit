// See https://github.com/ariakit/ariakit/issues/6320
import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("clears the arrow's stale static-side inset after a placement change", async () => {
  await click(q.button.ensure("Accept invite"));
  const dialog = q.dialog.ensure("Team meeting");
  const arrow = dialog.querySelector<HTMLElement>(".arrow");
  expect(arrow).toBeInTheDocument();
  if (!arrow) return;

  // happy-dom does no layout, so the scroll-driven flip from the browser test
  // can't happen here. The bug is still observable through the arrow's inline
  // insets: the initial `right` placement writes the static-side declaration
  // `right: 100%` on the arrow.
  await expect.poll(() => arrow.style.right).toBe("100%");

  // Changing the placement to `top` repositions the arrow with `top: 100%`.
  await click(q.button.ensure("Show above"));
  await expect.poll(() => arrow.style.top).toBe("100%");

  // The previous placement's `right: 100%` must be cleared. When it lingers,
  // RTL over-constrained absolute positioning ignores `left`, so the stale
  // `right` pins the arrow to the popover's left edge, detached from the
  // anchor.
  expect(arrow.style.right).toBe("");
});
