// See https://github.com/ariakit/ariakit/issues/6321
import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

const ringColor = "rgb(59, 130, 246)";

// happy-dom's getComputedStyle returns the declared box-shadow value (unitless
// zero lengths, color last) rather than the browser's normalized serialization
// (color first, all lengths in px), so this file exercises the declared-value
// form of the ring inference while the browser test covers the normalized
// form. With the reported bug present, the declared form missed ring
// detection for every case here (stroke: none), so only the browser test
// distinguishes the two reported defects (undetected ring width vs. wrong
// stroke color). React sets stroke-width unitless and happy-dom does not
// resolve it to px, so the expected widths are unitless here.
const cases = [
  { label: "Thin ring", strokeWidth: "2" },
  { label: "Thick ring", strokeWidth: "20" },
  { label: "Fractional ring", strokeWidth: "2" },
  { label: "Tailwind ring", strokeWidth: "6" },
];

for (const { label, strokeWidth } of cases) {
  test(`arrow stroke matches the ${label.toLowerCase()} box-shadow`, async () => {
    await click(q.button.ensure(label));
    const dialog = q.dialog.ensure(label);
    // The arrow SVG paths inherit the stroke and stroke-width set on the
    // arrow element, so the values on the arrow are what the user sees drawn
    // around the arrow notch.
    const arrow = dialog.querySelector(".arrow");
    expect(arrow).toBeInTheDocument();
    expect(arrow).toHaveStyle({ stroke: ringColor, strokeWidth });
  });
}
