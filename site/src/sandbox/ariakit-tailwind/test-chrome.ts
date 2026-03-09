import { AxeBuilder } from "@axe-core/playwright";
import type { Locator } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

function getLFromOklchString(color: string) {
  const oklch = color.match(/oklch\((?<l>\d+(?:\.\d+)?)/);
  if (!oklch?.groups?.l) {
    throw new Error(`Invalid oklch color: ${color}`);
  }
  return parseFloat(oklch.groups.l);
}

async function getL(
  locator: Locator,
  getProperty: (style: CSSStyleDeclaration) => string = (style) =>
    style.backgroundColor,
) {
  const style = await locator.evaluate((el) => getComputedStyle(el));
  return getLFromOklchString(getProperty(style));
}

async function getParentL(
  locator: Locator,
  getProperty: (style: CSSStyleDeclaration) => string = (style) =>
    style.backgroundColor,
) {
  const parent = await locator.evaluate((el) => {
    const parent = el.parentElement?.closest<HTMLElement>(".ak-layer");
    if (!parent) return null;
    return getComputedStyle(parent);
  });
  if (!parent) {
    throw new Error("Parent layer not found");
  }
  return getLFromOklchString(getProperty(parent));
}

withFramework(import.meta.dirname, async ({ test, query }) => {
  for (const scheme of ["light", "dark"] as const) {
    test.describe(`${scheme} scheme`, () => {
      test.use({ colorScheme: scheme });

      test("no color contrast violations (WCAG AA)", async ({ page }) => {
        const results = await new AxeBuilder({ page })
          .withRules(["color-contrast"])
          .analyze();
        test.expect(results.violations).toEqual([]);
      });

      for (const layer of ["layer", "state"] as const) {
        test(`${layer}-20 has 0.2 lightness distance from ${layer}-0`, async ({
          q,
        }) => {
          const layerNumber = q.region(`${layer}-<number>`).first();
          const layerNumber0 = query(layerNumber).region("0").first();
          const layerNumber020 = query(layerNumber0).region("20").first();
          const l = await getL(layerNumber020);
          const parentL = await getParentL(layerNumber020);
          const diff = Math.abs(l - parentL);
          test.expect(diff).toBeGreaterThanOrEqual(0.15);
          test.expect(diff).toBeLessThanOrEqual(0.2);
        });

        test(`${layer}-30 has 0.3 lightness distance from ${layer}-20`, async ({
          q,
        }) => {
          const layerNumber = q.region(`${layer}-<number>`).first();
          const layerNumber20 = query(layerNumber).region("0").first();
          const layerNumber2030 = query(layerNumber20).region("30").first();
          const l = await getL(layerNumber2030);
          const parentL = await getParentL(layerNumber2030);
          const diff = Math.abs(l - parentL);
          test.expect(diff).toBeGreaterThanOrEqual(0.25);
          test.expect(diff).toBeLessThanOrEqual(0.3);
        });
      }
    });
  }
});
