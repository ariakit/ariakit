// See https://github.com/ariakit/ariakit/issues/6321
import { withFramework } from "#app/test-utils/preview.ts";

const ringColor = "rgb(59, 130, 246)";

withFramework(import.meta.dirname, async ({ test }) => {
  const cases = [
    // A 1px ring is detected by the current width regex, but the arrow stroke
    // must also match the ring color instead of the inherited text color.
    { label: "Thin ring", strokeWidth: "2px" },
    // Spread widths whose px text contains a 0 digit (10px) are rejected by
    // the current regex, leaving the arrow with no stroke at all.
    { label: "Thick ring", strokeWidth: "20px" },
    // Fractional widths (0.5px) are rejected too, and must round up like the
    // border-width path does (Math.ceil), so 0.5px draws a 1px ring.
    { label: "Fractional ring", strokeWidth: "2px" },
    // Tailwind v3 multi-shadow rings: zero-spread placeholders are skipped and
    // the ring segment provides both the width and the color.
    { label: "Tailwind ring", strokeWidth: "6px" },
  ];

  for (const { label, strokeWidth } of cases) {
    test(`arrow stroke matches the ${label.toLowerCase()} box-shadow`, async ({
      q,
    }) => {
      await q.button(label).click();
      const dialog = q.dialog(label);
      await test.expect(dialog).toBeVisible();
      // The arrow SVG paths inherit the stroke and stroke-width set on the
      // arrow element, so the computed values on the arrow are what the user
      // sees drawn around the arrow notch.
      const arrow = dialog.locator(".arrow");
      await test.expect(arrow).toHaveCSS("stroke", ringColor);
      await test.expect(arrow).toHaveCSS("stroke-width", strokeWidth);
    });
  }
});
