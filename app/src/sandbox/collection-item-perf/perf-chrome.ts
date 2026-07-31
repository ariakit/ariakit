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

function getItem(page: Page, itemNumber: number) {
  return page.locator(`[data-item="Item ${itemNumber}"]`);
}

async function getPassiveItemDiagnostics(page: Page) {
  return getItem(page, 1).evaluate(async (element) => {
    const root = element.parentElement;
    if (!root) throw new Error("Expected Item 1 to have a parent element");

    const serializeRect = (rect: DOMRect) => ({
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });

    const intersection = await new Promise((resolve) => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          clearTimeout(timeoutId);
          observer.disconnect();
          resolve(
            entry
              ? {
                  received: true,
                  isIntersecting: entry.isIntersecting,
                  intersectionRatio: entry.intersectionRatio,
                  boundingClientRect: serializeRect(entry.boundingClientRect),
                  intersectionRect: serializeRect(entry.intersectionRect),
                  rootBounds: entry.rootBounds
                    ? serializeRect(entry.rootBounds)
                    : null,
                }
              : { received: true, entry: null },
          );
        },
        { root, rootMargin: "40%" },
      );
      const timeoutId = window.setTimeout(() => {
        observer.disconnect();
        resolve({ received: false });
      }, 1000);
      observer.observe(element);
    });

    const idleCallback = await new Promise((resolve) => {
      const startedAt = performance.now();
      const timeoutId = window.setTimeout(() => {
        window.cancelIdleCallback(callbackId);
        resolve({ fired: false });
      }, 1000);
      const callbackId = window.requestIdleCallback(
        (deadline) => {
          clearTimeout(timeoutId);
          resolve({
            fired: true,
            elapsed: performance.now() - startedAt,
            didTimeout: deadline.didTimeout,
            timeRemaining: deadline.timeRemaining(),
          });
        },
        { timeout: 500 },
      );
    });

    const itemStyle = getComputedStyle(element);
    const rootStyle = getComputedStyle(root);
    return {
      componentOffscreen: element.hasAttribute("data-offscreen"),
      connected: element.isConnected,
      rootContainsItem: root.contains(element),
      itemRect: serializeRect(element.getBoundingClientRect()),
      rootRect: serializeRect(root.getBoundingClientRect()),
      itemStyle: {
        display: itemStyle.display,
        visibility: itemStyle.visibility,
      },
      rootStyle: {
        display: rootStyle.display,
        overflowY: rootStyle.overflowY,
      },
      rootScrollTop: root.scrollTop,
      rootClientHeight: root.clientHeight,
      rootScrollHeight: root.scrollHeight,
      viewport: {
        width: document.documentElement.clientWidth,
        height: document.documentElement.clientHeight,
      },
      intersection,
      idleCallback,
    };
  });
}

async function waitForCollectionMounted(page: Page) {
  await getItem(page, itemCount).waitFor({ state: "attached" });
  if (offscreen) {
    await page.locator("[data-offscreen]").first().waitFor();
    try {
      await page
        .locator('[data-item="Item 1"]:not([data-offscreen])')
        .waitFor({ timeout: 5000 });
    } catch (error) {
      const diagnostics = await getPassiveItemDiagnostics(page);
      throw new Error(
        `Passive Item 1 did not materialize: ${JSON.stringify(diagnostics)}`,
        { cause: error },
      );
    }
  }
}

async function mountCollection(page: Page, q: Query) {
  await q.button("Mount collection").click();
  await waitForCollectionMounted(page);
}

async function verifyCollectionMounted(page: Page, q: Query) {
  await expect(page.locator("[data-item]")).toHaveCount(itemCount);
  await expect(q.status("Item variant")).toHaveText(itemVariant);
}

async function unmountCollection(page: Page, q: Query) {
  await q.button("Unmount collection").click();
  await page.locator("[data-item]").first().waitFor({ state: "detached" });
}

async function verifyCollectionUnmounted(page: Page) {
  await expect(page.locator("[data-item]")).toHaveCount(0);
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

async function verifyCollectionScrolled(page: Page, q: Query) {
  await expect(getItem(page, itemCount)).not.toHaveAttribute("data-offscreen");
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
      verify: ({ page, q }) => verifyCollectionMounted(page, q),
    });
  });

  test("unmount collection", async ({ perf }) => {
    await perf.measure(({ page, q }) => unmountCollection(page, q), {
      setup: ({ page, q }) => mountCollection(page, q),
      verify: ({ page }) => verifyCollectionUnmounted(page),
    });
  });

  test("scroll collection", async ({ perf }) => {
    await perf.measure(({ page, q }) => scrollCollection(page, q), {
      setup: ({ page, q }) => mountCollection(page, q),
      verify: ({ page, q }) => verifyCollectionScrolled(page, q),
    });
  });
});
