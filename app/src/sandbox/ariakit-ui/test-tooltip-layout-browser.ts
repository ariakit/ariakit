import type { Locator, Page } from "@playwright/test";
import {
  waitForPreviewHydration,
  withFramework,
} from "#app/test-utils/preview.ts";
import { GALLERY_STORAGE_PREFIX } from "./pages.ts";

async function getBox(locator: Locator) {
  const box = await locator.boundingBox();
  if (!box) {
    throw new Error("Element has no bounding box");
  }
  return box;
}

/**
 * Waits for a tooltip to scale in, so its box has its final size.
 */
async function waitForEntry(tooltip: Locator) {
  await tooltip.evaluate((node) =>
    Promise.all(node.getAnimations().map((animation) => animation.finished)),
  );
}

async function loadWithFontSize(page: Page, fontSize: string) {
  await page.evaluate(({ key, value }) => localStorage.setItem(key, value), {
    key: `${GALLERY_STORAGE_PREFIX}font-size`,
    value: fontSize,
  });
  await page.reload({ waitUntil: "load" });
  await waitForPreviewHydration(page);
}

withFramework(
  import.meta.dirname,
  { route: "tooltip" },
  async ({ test, query }) => {
    test("wraps a long label at the tooltip maximum width", async ({ q }) => {
      const tooltip = query(q.article("Long label")).tooltip();
      await test.expect(tooltip).toBeVisible();
      // 20em at the tooltip's 14px text.
      await test.expect(tooltip).toHaveCSS("max-width", "280px");
      const lineHeight = await tooltip.evaluate((node) =>
        Number.parseFloat(getComputedStyle(node).lineHeight),
      );
      const { width, height } = await getBox(tooltip);
      test.expect(width).toBeLessThanOrEqual(280);
      test.expect(height).toBeGreaterThan(lineHeight * 2);
    });

    test("keeps a short label on one line", async ({ q }) => {
      const tooltip = q.tooltip("Save changes");
      const lineHeight = await tooltip.evaluate((node) =>
        Number.parseFloat(getComputedStyle(node).lineHeight),
      );
      const { height } = await getBox(tooltip);
      test.expect(height).toBeLessThan(lineHeight * 2);
    });

    for (const fontSize of ["sm", "md", "lg"]) {
      test(`keeps every held tooltip inside its box at the ${fontSize} text size`, async ({
        page,
        q,
      }) => {
        await loadWithFontSize(page, fontSize);
        const articles = await q.article().all();
        let held = 0;
        for (const article of articles) {
          const tooltips = await query(article).tooltip().all();
          for (const tooltip of tooltips) {
            held += 1;
            await waitForEntry(tooltip);
            const articleBox = await getBox(article);
            const headerBox = await getBox(article.locator("header"));
            const snippetBox = await getBox(article.locator("pre"));
            const tooltipBox = await getBox(tooltip);
            // The tooltip is out of flow, so only its stage keeps it between
            // the box header and the snippet.
            test
              .expect(tooltipBox.y)
              .toBeGreaterThanOrEqual(headerBox.y + headerBox.height);
            test
              .expect(tooltipBox.y + tooltipBox.height)
              .toBeLessThanOrEqual(snippetBox.y);
            test.expect(tooltipBox.x).toBeGreaterThanOrEqual(articleBox.x);
            test
              .expect(tooltipBox.x + tooltipBox.width)
              .toBeLessThanOrEqual(articleBox.x + articleBox.width);
          }
        }
        test.expect(held).toBe(9);
      });
    }
  },
);
