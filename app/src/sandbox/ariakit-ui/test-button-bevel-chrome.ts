import type { Locator } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

function getStyle(locator: Locator, property: "backgroundColor" | "color") {
  return locator.evaluate(
    (node, name) => getComputedStyle(node)[name],
    property,
  );
}

// The lightness channel of an oklch() color, as the engine computes it.
function getLightness(color: string) {
  const match = color.match(/^oklch\(([\d.]+)/);
  return match ? Number(match[1]) : Number.NaN;
}

withFramework(
  import.meta.dirname,
  { route: "button" },
  async ({ test, query }) => {
    test("a bevel on a color paints the color of the flat button", async ({
      q,
    }) => {
      const flat = query(q.article("Danger")).button("Delete");
      const bevel = query(q.article("Danger bevel")).button("Delete project");
      // A lighten on the danger color lands in the contrast pipeline's
      // ambiguous midrange, which moves it far past the step and flips the text
      // to black. The flat lift keeps the color and the white text.
      await test
        .expect(bevel)
        .toHaveCSS("background-color", await getStyle(flat, "backgroundColor"));
      await test
        .expect(bevel)
        .toHaveCSS("color", await getStyle(flat, "color"));
    });

    test("a disabled bevel keeps a visible surface", async ({ q }) => {
      const disabled = query(q.article("Disabled bevel")).button("Archive");
      const focusable = query(q.article("Focusable disabled")).button("Export");
      // The lighten alone lands on white over the light canvas, where the wiped
      // bevel would disappear.
      const background = await getStyle(disabled, "backgroundColor");
      test.expect(getLightness(background)).toBeLessThan(0.98);
      // The aria-disabled path paints the same as the native one.
      await test.expect(focusable).toHaveCSS("background-color", background);
    });
  },
);
