import type { Locator } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

/**
 * Returns the WCAG contrast ratio between the chip's text color and its own
 * background. A canvas resolves each color to 8-bit sRGB, so every CSS color
 * syntax the engine computes, such as oklch() or lch(), compares the same way.
 */
function getContrast(locator: Locator) {
  return locator.evaluate((node) => {
    const canvas = node.ownerDocument.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("No 2D canvas context");
    const getLuminance = (color: string) => {
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = color;
      context.fillRect(0, 0, 1, 1);
      const [red = 0, green = 0, blue = 0] = context.getImageData(
        0,
        0,
        1,
        1,
      ).data;
      const toLinear = (value: number) => {
        const channel = value / 255;
        if (channel <= 0.04045) return channel / 12.92;
        return ((channel + 0.055) / 1.055) ** 2.4;
      };
      return (
        0.2126 * toLinear(red) +
        0.7152 * toLinear(green) +
        0.0722 * toLinear(blue)
      );
    };
    const style = getComputedStyle(node);
    const text = getLuminance(style.color);
    const background = getLuminance(style.backgroundColor);
    const lighter = Math.max(text, background);
    const darker = Math.min(text, background);
    return (lighter + 0.05) / (darker + 0.05);
  });
}

// The chip colors come from the layer utilities, which compute the same in
// every engine, so Chrome is enough.
withFramework(
  import.meta.dirname,
  { route: "code" },
  async ({ query, test }) => {
    for (const colorScheme of ["light", "dark"] as const) {
      test(`reads a colored chip in ${colorScheme} mode`, async ({
        page,
        q,
      }) => {
        await page.emulateMedia({ colorScheme });
        const chip = query(q.article("Colored layer")).text(`$kind="flat"`);
        // A solid danger fill under the surrounding ink measured 3.48:1 in
        // light mode and 2.62:1 in dark mode.
        test.expect(await getContrast(chip)).toBeGreaterThanOrEqual(4.5);
      });

      test(`reads an inverted chip in ${colorScheme} mode`, async ({
        page,
        q,
      }) => {
        await page.emulateMedia({ colorScheme });
        const chip = query(q.article("Inverted")).text("pnpm build");
        // The surrounding ink on the inverted face measured 1.24:1 in light
        // mode and 1.12:1 in dark mode.
        test.expect(await getContrast(chip)).toBeGreaterThanOrEqual(4.5);
      });
    }

    test("draws the ring of a chip without a layer in the edge color around it", async ({
      q,
    }) => {
      const chip = query(q.article("No layer")).text("aria-expanded");
      await test.expect(chip).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
      const { edge, shadow } = await chip.evaluate((node) => {
        const style = getComputedStyle(node);
        return {
          edge: style.getPropertyValue("--ak-edge").trim(),
          shadow: style.boxShadow,
        };
      });
      // Without a layer to color it, the ring fell back to the full-alpha text
      // color, a hard black outline in light mode.
      test.expect(shadow).toContain(`${edge} 0px 0px 0px 1px`);
      test.expect(edge).toMatch(/ \/ 0\.\d+\)$/);
    });

    test("draws a raw edge at full alpha", async ({ q }) => {
      const chip = query(q.article("Raw brand edge")).text("@ariakit/ui");
      const edge = await chip.evaluate((node) =>
        getComputedStyle(node).getPropertyValue("--ak-edge").trim(),
      );
      // The chip's default edge weight used to sort after the raw utility and
      // dim the brand ring to 15% alpha.
      test.expect(edge).toMatch(/^oklch\(0\.567 0\.1546 248\.51\d*\)$/);
    });
  },
);
