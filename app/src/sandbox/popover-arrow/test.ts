import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

const ringColor = "rgb(59, 130, 246)";

const cases = [
  { label: "Thin ring", strokeWidth: "2" },
  { label: "Thick ring", strokeWidth: "20" },
  { label: "Fractional ring", strokeWidth: "2" },
  { label: "Tailwind ring", strokeWidth: "6" },
  { label: "Inset ring", strokeWidth: "4" },
  // A ring with an omitted color defaults to currentColor, so the stroke must
  // resolve to the popover's text color, not its border color. Declared
  // values keep the color omitted, so this exercises the currentColor
  // fallback directly, unlike browsers, which serialize the resolved color
  // into the computed box-shadow.
  {
    label: "Current color ring",
    strokeWidth: "4",
    stroke: "rgb(220, 38, 38)",
  },
];

// See https://github.com/ariakit/ariakit/issues/6320
test("clears the arrow's stale static-side inset after a placement change", async () => {
  await click(q.button("Accept invite"));
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
  await click(q.button("Show above"));
  await expect.poll(() => arrow.style.top).toBe("100%");

  // The previous placement's `right: 100%` must be cleared. When it lingers,
  // RTL over-constrained absolute positioning ignores `left`, so the stale
  // `right` pins the arrow to the popover's left edge, detached from the
  // anchor. Poll instead of asserting synchronously so the check also covers
  // clearing that happens right after the reposition, such as the userland
  // workaround for this bug, without racing it.
  await expect.poll(() => arrow.style.right).toBe("");
});

// See https://github.com/ariakit/ariakit/issues/6321
for (const { label, strokeWidth, stroke } of cases) {
  test(`arrow stroke matches the ${label.toLowerCase()} box-shadow`, async () => {
    await click(q.button(label));
    const dialog = q.dialog.ensure(label);
    // The arrow SVG paths inherit the stroke and stroke-width set on the
    // arrow element, so the values on the arrow are what the user sees drawn
    // around the arrow notch.
    const arrow = dialog.querySelector(".arrow");
    expect(arrow).toBeInTheDocument();
    if (!arrow) return;
    const computedStyle = getComputedStyle(arrow);
    expect(computedStyle.stroke).toBe(stroke ?? ringColor);
    expect(Number.parseFloat(computedStyle.strokeWidth)).toBe(
      Number(strokeWidth),
    );
  });
}
