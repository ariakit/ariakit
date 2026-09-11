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

async function getGap(anchor: Locator, overlay: Locator) {
  const anchorBox = await getBox(anchor);
  const overlayBox = await getBox(overlay);
  return overlayBox.y - (anchorBox.y + anchorBox.height);
}

/**
 * Waits for a popover to scale in, so its box has its final size.
 */
async function waitForEntry(popover: Locator) {
  await popover.evaluate((node) =>
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
  { route: "popover" },
  async ({ test, query }) => {
    test("floats a popover without an arrow 8px away from its disclosure", async ({
      q,
    }) => {
      const box = query(q.article("Default"));
      const held = await getGap(
        box.button("Accept invite"),
        box.dialog("Team meeting"),
      );
      test.expect(held).toBeCloseTo(8, 0);

      const disclosure = q.button("Event details");
      await disclosure.click();
      const live = q.dialog("Design review");
      await test.expect(live).toBeVisible();
      // The entry animation scales the popover from its anchor side, so the gap
      // is only final once the transition has ended.
      await test.expect
        .poll(async () => Math.round(await getGap(disclosure, live)))
        .toBe(8);
    });

    test("renders a dismiss without children as a square icon button", async ({
      q,
    }) => {
      const box = query(q.article("Close button"));
      await waitForEntry(box.dialog("Notifications"));
      const dismiss = box.button("Dismiss popup");
      const { width, height } = await getBox(dismiss);
      test.expect(width).toBeCloseTo(height, 0);
      // WCAG 2.2 minimum target size.
      test.expect(width).toBeGreaterThanOrEqual(24);
      await dismiss.click();
      await test.expect(box.dialog("Notifications")).toBeHidden();
    });

    for (const fontSize of ["sm", "md", "lg"]) {
      test(`keeps every held popover inside its box at the ${fontSize} text size`, async ({
        page,
        q,
      }) => {
        await loadWithFontSize(page, fontSize);
        const articles = await q.article().all();
        let held = 0;
        for (const article of articles) {
          const box = query(article);
          const popovers = await box.dialog().all();
          for (const popover of popovers) {
            held += 1;
            await waitForEntry(popover);
            const articleBox = await getBox(article);
            const popoverBox = await getBox(popover);
            const snippetBox = await getBox(article.locator("pre"));
            // The popover is out of flow, so only its stage keeps it off the
            // snippet below it and inside the box.
            test
              .expect(popoverBox.y + popoverBox.height)
              .toBeLessThanOrEqual(snippetBox.y);
            test.expect(popoverBox.x).toBeGreaterThanOrEqual(articleBox.x);
            test
              .expect(popoverBox.x + popoverBox.width)
              .toBeLessThanOrEqual(articleBox.x + articleBox.width);
          }
        }
        test.expect(held).toBe(10);
      });
    }
  },
);
