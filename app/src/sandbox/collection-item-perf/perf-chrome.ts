import type { query } from "@ariakit/test/playwright";
import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import {
  flushFrames,
  gotoAndSettle,
  withFramework,
} from "#app/test-utils/preview.ts";

const itemCount = 1000;
const itemSize = 32;
const scrollItemNumbers = [200, 400, 600, 800, 1000];
const itemVariant = process.env.PERF_ITEM_VARIANT ?? "base";
const offscreen = itemVariant === "offscreen";

if (itemVariant !== "base" && itemVariant !== "offscreen") {
  throw new Error(`Invalid PERF_ITEM_VARIANT: ${itemVariant}`);
}

type Query = ReturnType<typeof query>;

function getScroller(q: Query) {
  return q.list("Collection items");
}

async function waitForCollectionMounted(page: Page, q: Query) {
  await q.listitem(`Item ${itemCount}`).waitFor({ state: "attached" });
  if (offscreen) {
    await page.locator("[data-offscreen]").first().waitFor();
    await page.locator('[data-item="Item 1"]:not([data-offscreen])').waitFor();
  }
}

async function mountCollection(page: Page, q: Query) {
  await q.button("Mount collection").click();
  await waitForCollectionMounted(page, q);
}

async function verifyCollectionMounted(q: Query) {
  await expect(q.listitem()).toHaveCount(itemCount);
  await expect(q.status("Item variant")).toHaveText(itemVariant);
}

async function unmountCollection(q: Query) {
  await q.button("Unmount collection").click();
  await q.listitem().first().waitFor({ state: "detached" });
}

async function verifyCollectionUnmounted(q: Query) {
  await expect(q.listitem()).toHaveCount(0);
}

async function scrollCollection(page: Page, q: Query) {
  const scroller = getScroller(q);
  for (const itemNumber of scrollItemNumbers) {
    await scroller.evaluate(
      (element, scrollTop) => {
        element.scrollTo({ top: scrollTop });
      },
      (itemNumber - 1) * itemSize,
    );
    await flushFrames(page);
    await page
      .locator(`[data-item="Item ${itemNumber}"]:not([data-offscreen])`)
      .waitFor({ state: "attached" });
  }
}

async function verifyCollectionScrolled(q: Query) {
  await expect(q.listitem(`Item ${itemCount}`)).not.toHaveAttribute(
    "data-offscreen",
  );
  await expect
    .poll(() => getScroller(q).evaluate((element) => element.scrollTop))
    .toBeGreaterThan(0);
}

withFramework(import.meta.dirname, async ({ test }) => {
  test.beforeEach(async ({ page, q }) => {
    const url = new URL(page.url());
    url.searchParams.set("item", itemVariant);
    await gotoAndSettle(page, url.href);
    await expect(q.status("Item variant")).toHaveText(itemVariant);
  });

  test("mount collection", async ({ perf }) => {
    await perf.measure(({ page, q }) => mountCollection(page, q), {
      verify: ({ q }) => verifyCollectionMounted(q),
    });
  });

  test("unmount collection", async ({ perf }) => {
    await perf.measure(({ q }) => unmountCollection(q), {
      setup: ({ page, q }) => mountCollection(page, q),
      verify: ({ q }) => verifyCollectionUnmounted(q),
    });
  });

  test("scroll collection", async ({ perf }) => {
    await perf.measure(({ page, q }) => scrollCollection(page, q), {
      setup: ({ page, q }) => mountCollection(page, q),
      verify: ({ q }) => verifyCollectionScrolled(q),
    });
  });
});
