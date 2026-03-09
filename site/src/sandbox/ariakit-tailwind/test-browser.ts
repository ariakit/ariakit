import { AxeBuilder } from "@axe-core/playwright";
import { withFramework } from "#app/test-utils/preview.ts";

/**
 * Extracts perceptual lightness (0-1) from a computed color string. Handles
 * oklch, rgb, and color(srgb) formats across browsers.
 */
function lightness(color: string): number {
  const oklch = color.match(/oklch\((\d+(?:\.\d+)?)/);
  if (oklch) return parseFloat(oklch[1]);
  // color(srgb r g b) — values are 0-1
  const srgb = color.match(
    /color\(srgb\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)/,
  );
  if (srgb) {
    const [r, g, b] = [
      parseFloat(srgb[1]),
      parseFloat(srgb[2]),
      parseFloat(srgb[3]),
    ];
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }
  // rgb(r, g, b) — values are 0-255
  const rgb = color.match(
    /rgba?\((\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)/,
  );
  if (rgb) {
    const [r, g, b] = [
      parseFloat(rgb[1]),
      parseFloat(rgb[2]),
      parseFloat(rgb[3]),
    ];
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  }
  return 0;
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
    // For each auto lightness section (ak-layer-<number> and ak-state-<number>),
    // verify that child layers produce monotonically increasing lightness
    // distance from the parent as the layer number grows.
    for (const sectionTitle of ["ak-layer-<number>", "ak-state-<number>"]) {
      const section = q(page).region(sectionTitle).first();
      const data = await section.evaluate((section) => {
        const container = section.querySelector(":scope > div:last-child");
        if (!container) return [];
        const parents = container.querySelectorAll(":scope > section");
        return Array.from(parents).map((parent) => {
          const parentTitle =
            (parent.firstElementChild as HTMLElement)?.textContent ?? "";
          const parentBg = getComputedStyle(parent).backgroundColor;
          const childContainer = parent.querySelector(
            ":scope > div:last-child",
          );
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
