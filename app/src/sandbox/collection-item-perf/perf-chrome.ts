import type { query } from "@ariakit/test/playwright";
import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import {
  comparesOffscreenItems,
  getItemName,
  itemParam,
  itemTestTitle,
  scrollThroughItems,
  verifyScrolledThroughItems,
  waitForVisibleItems,
} from "#app/test-utils/offscreen-item-perf.ts";
import { gotoAndSettle, withFramework } from "#app/test-utils/preview.ts";

const itemCount = 1000;

type Query = ReturnType<typeof query>;

function getScroller(q: Query) {
  return q.list("Collection items");
}

async function mountCollection(page: Page, q: Query) {
  await q.button("Mount collection").click();
  await page
    .locator(`[data-item="${getItemName(itemCount)}"]`)
    .waitFor({ state: "attached" });
  await waitForVisibleItems(page, getItemName);
}

async function verifyCollectionMounted(page: Page, q: Query) {
  await expect(page.locator("[data-item]")).toHaveCount(itemCount);
  await expect(q.status("Item variant")).toHaveText(itemParam);
}

async function unmountCollection(page: Page, q: Query) {
  await q.button("Unmount collection").click();
  await page.locator("[data-item]").first().waitFor({ state: "detached" });
}

async function verifyCollectionUnmounted(page: Page) {
  await expect(page.locator("[data-item]")).toHaveCount(0);
}

withFramework(import.meta.dirname, async ({ test }) => {
  test.beforeEach(async ({ page, q }) => {
    const url = new URL(page.url());
    url.searchParams.set("item", itemParam);
    await gotoAndSettle(page, url.href);
    await expect(q.status("Item variant")).toHaveText(itemParam);
  });

  test(itemTestTitle("mount collection"), async ({ perf }) => {
    await perf.measure(({ page, q }) => mountCollection(page, q), {
      verify: ({ page, q }) => verifyCollectionMounted(page, q),
    });
  });

  test(itemTestTitle("unmount collection"), async ({ perf }) => {
    await perf.measure(({ page, q }) => unmountCollection(page, q), {
      setup: ({ page, q }) => mountCollection(page, q),
      verify: ({ page }) => verifyCollectionUnmounted(page),
    });
  });

  // Only offscreen items do work while scrolling, so this stays out of the
  // version comparison, where both sides would measure harness overhead.
  if (comparesOffscreenItems) {
    test(itemTestTitle("scroll collection"), async ({ perf }) => {
      await perf.measure(
        ({ page, q }) =>
          scrollThroughItems({ page, scroller: getScroller(q), getItemName }),
        {
          setup: ({ page, q }) => mountCollection(page, q),
          verify: async ({ page, q }) => {
            await verifyScrolledThroughItems({
              page,
              scroller: getScroller(q),
              getItemName,
            });
            await expect(q.status("Item variant")).toHaveText(itemParam);
          },
        },
      );
    });
  }
});
