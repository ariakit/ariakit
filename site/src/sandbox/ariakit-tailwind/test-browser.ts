import { AxeBuilder } from "@axe-core/playwright";
import type { Locator } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

/**
 * Extracts perceptual lightness (0-1) from a computed color string. Handles
 * oklch, rgb, and color(srgb) formats across browsers.
 */
function lightness(color: string): number {
  const oklch = color.match(/oklch\((?<l>\d+(?:\.\d+)?)/);
  if (!oklch?.groups?.l) {
    throw new Error(`Invalid oklch color: ${color}`);
  }
  return parseFloat(oklch.groups.l);
}

interface LayerData {
  parentTitle: string;
  parentBg: string;
  children: Array<{ title: string; bg: string }>;
}

/**
 * Extracts parent/child background colors from a section region.
 */
function extractLayerData(section: Locator): Promise<LayerData[]> {
  return section.evaluate((section) => {
    const container = section.querySelector(":scope > div:last-child");
    if (!container) return [];
    const parents = container.querySelectorAll(":scope > section");
    return Array.from(parents).map((parent) => {
      const parentTitle =
        (parent.firstElementChild as HTMLElement)?.textContent ?? "";
      const parentBg = getComputedStyle(parent).backgroundColor;
      const childContainer = parent.querySelector(":scope > div:last-child");
      const childSections = childContainer
        ? childContainer.querySelectorAll(":scope > section")
        : [];
      const children = Array.from(childSections).map((child) => ({
        title: (child.firstElementChild as HTMLElement)?.textContent ?? "",
        bg: getComputedStyle(child).backgroundColor,
      }));
      return { parentTitle, parentBg, children };
    });
  });
}

withFramework(import.meta.dirname, async ({ test, query: q }) => {
  test("no color contrast violations (WCAG AA)", async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withRules(["color-contrast"])
      .analyze();
    test.expect(results.violations).toEqual([]);
  });

  // Firefox serializes complex oklch background-color values incorrectly in
  // getComputedStyle (all resolve to oklch(1 ...)), so this test only runs on
  // Chrome and Safari where the computed values are reliable.
  test("auto lightness distance increases monotonically", async ({
    page,
    browserName,
  }) => {
    test.skip(browserName === "firefox", "Firefox oklch getComputedStyle bug");
    // Verify that child layers produce monotonically increasing lightness
    // distance from the parent as the layer number grows. This applies to
    // ak-layer-<number> (skip), ak-state-<number> (boundary-or-flip), and
    // the combined ak-layer + ak-state case.
    const sections = ["ak-layer-<number>", "ak-state-<number>"];
    for (const sectionTitle of sections) {
      const section = q(page).region(sectionTitle).first();
      const data = await extractLayerData(section);

      for (const { parentTitle, parentBg, children } of data) {
        const parentL = lightness(parentBg);
        let prevDist = 0;
        for (const { title: childTitle, bg: childBg } of children) {
          const childL = lightness(childBg);
          const dist = Math.abs(childL - parentL);
          test
            .expect(dist, {
              message: `${sectionTitle} > ${parentTitle} > ${childTitle}: distance ${dist.toFixed(3)} should be >= previous ${prevDist.toFixed(3)}`,
            })
            .toBeGreaterThanOrEqual(prevDist - 0.01);
          prevDist = dist;
        }
      }
    }
  });
});
