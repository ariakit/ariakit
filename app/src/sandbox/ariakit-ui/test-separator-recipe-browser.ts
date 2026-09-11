import type { Locator } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

function getEdgeColor(locator: Locator) {
  return locator.evaluate((node) => getComputedStyle(node).borderTopColor);
}

/** Reads the lightness channel of an `oklch()` color. */
function getLightness(color: string) {
  const [lightness = ""] = color.slice("oklch(".length).split(" ");
  return Number.parseFloat(lightness);
}

function getRect(locator: Locator) {
  return locator.evaluate((node) => {
    const { top, bottom } = node.getBoundingClientRect();
    return { top, bottom };
  });
}

// The edge colors come from relative colors and container style queries, which
// each engine resolves on its own, so this file runs in every desktop project.
withFramework(
  import.meta.dirname,
  { route: "separator" },
  async ({ query, test }) => {
    test("paints a raw edge color at full alpha", async ({ q }) => {
      const color = await getEdgeColor(
        query(q.article("Brand rule")).separator(),
      );
      // The default medium weight used to be emitted over the raw edge and sort
      // after it, so the brand rule came out at 20% alpha.
      test.expect(color).toMatch(/^oklch\([\d.]+ [\d.]+ [\d.]+\)$/);
      // The brand color's own lightness, not pushed to black or white.
      test.expect(getLightness(color)).toBeGreaterThan(0.2);
      test.expect(getLightness(color)).toBeLessThan(0.8);
    });

    test("draws an almost black rule on a mid-dark surface", async ({ q }) => {
      const color = await getEdgeColor(
        query(q.article("Dark dividers")).separator(),
      );
      // Without the variant, the edge push takes the rule to white here.
      test.expect(getLightness(color)).toBeLessThan(0.2);
    });

    test("puts a heading after the rule as far from it as the text above", async ({
      q,
    }) => {
      const box = query(q.article("Before a heading"));
      const paragraph = await getRect(box.text("A paragraph before the rule."));
      const rule = await getRect(box.separator());
      const heading = await getRect(box.heading("Section heading"));
      const above = rule.top - paragraph.bottom;
      const below = heading.top - rule.bottom;
      test.expect(Math.abs(below - above)).toBeLessThan(0.5);
    });
  },
);
