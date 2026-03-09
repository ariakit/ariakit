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

async function getLightnessDiff(
  locator: Locator,
  getProperty: (style: CSSStyleDeclaration) => string = (style) =>
    style.backgroundColor,
) {
  const lightness = await getL(locator, getProperty);
  const parentLightness = await getParentL(locator, getProperty);
  return Math.abs(lightness - parentLightness);
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
          const layerNumber020 = query(layerNumber0).region("20");
          const diff = await getLightnessDiff(layerNumber020);
          test.expect(diff).toBeGreaterThanOrEqual(0.15);
          test.expect(diff).toBeLessThanOrEqual(0.21);
        });

        test(`${layer}-30 has 0.3 lightness distance from ${layer}-20`, async ({
          q,
        }) => {
          const layerNumber = q.region(`${layer}-<number>`).first();
          const layerNumber20 = query(layerNumber).region("0").first();
          const layerNumber2030 = query(layerNumber20).region("30");
          const diff = await getLightnessDiff(layerNumber2030);
          test.expect(diff).toBeGreaterThanOrEqual(0.25);
          test.expect(diff).toBeLessThanOrEqual(0.31);
        });

        test(`${layer}-10 has 0.1 lightness distance from ${layer}-40`, async ({
          q,
        }) => {
          const layerNumber = q.region(`${layer}-<number>`).first();
          const layerNumber40 = query(layerNumber).region("40").nth(4);
          const layerNumber4010 = query(layerNumber40).region("10").first();
          const diff = await getLightnessDiff(layerNumber4010);
          test.expect(diff).toBeGreaterThanOrEqual(0.05);
          test.expect(diff).toBeLessThanOrEqual(0.11);
        });
      }

      test("layer-contrast matches layer below the forbidden band", async ({
        q,
      }) => {
        const layerLayers = q.region("ak-layer-<number>").first();
        const contrastLayers = q.region("ak-layer-contrast-<number>").first();
        const layer0 = query(layerLayers).region("0").first();
        const contrast0 = query(contrastLayers).region("0").first();
        const layer20 = query(layer0).region("20").first();
        const contrast20 = query(contrast0).region("20").first();
        const layerLightness = await getL(layer20);
        const contrastLightness = await getL(contrast20);
        test
          .expect(Math.abs(layerLightness - contrastLightness))
          .toBeLessThan(0.01);
      });

      test("layer-contrast jumps when crossing the forbidden band", async ({
        q,
      }) => {
        const jumpParent = 0;
        const jumpChild = scheme === "light" ? 30 : 50;
        const jumpParentIndex = jumpParent / 10;
        const layerLayers = q.region("ak-layer-<number>").first();
        const contrastLayers = q.region("ak-layer-contrast-<number>").first();
        const layerParent = query(layerLayers)
          .region(String(jumpParent))
          .nth(jumpParentIndex);
        const contrastParent = query(contrastLayers)
          .region(String(jumpParent))
          .nth(jumpParentIndex);
        const layerChild = query(layerParent).region(String(jumpChild)).first();
        const contrastChild = query(contrastParent)
          .region(String(jumpChild))
          .first();
        const layerDiff = await getLightnessDiff(layerChild);
        const contrastDiff = await getLightnessDiff(contrastChild);
        test.expect(contrastDiff).toBeGreaterThan(layerDiff + 0.05);
      });

      test("layer-contrast keeps progressing after the jump", async ({ q }) => {
        const progressionParent = 0;
        const progressionValues =
          scheme === "light" ? [20, 30, 40] : [40, 50, 60];
        const progressionParentIndex = progressionParent / 10;
        const contrastLayers = q.region("ak-layer-contrast-<number>").first();
        const contrastParent = query(contrastLayers)
          .region(String(progressionParent))
          .nth(progressionParentIndex);
        const diffs = await Promise.all(
          progressionValues.map((value) =>
            getLightnessDiff(
              query(contrastParent).region(String(value)).first(),
            ),
          ),
        );
        test.expect(diffs[1]).toBeGreaterThan(diffs[0] + 0.02);
        test.expect(diffs[2]).toBeGreaterThan(diffs[1] + 0.02);
      });
    });
  }
});
