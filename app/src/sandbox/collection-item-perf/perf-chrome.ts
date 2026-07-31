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

async function startPassiveItemTransitionLog(page: Page) {
  await page.evaluate(() => {
    interface Transition {
      kind: "intersection" | "snapshot";
      id?: number;
      reason?: string;
      offscreen?: boolean;
      connected?: boolean;
      isIntersecting?: boolean;
      intersectionRatio?: number;
      rect?: {
        top: number;
        bottom: number;
        width: number;
        height: number;
      };
    }

    interface DiagnosticWindow extends Window {
      __passiveItemMutationObserver?: MutationObserver;
      __passiveItemObservers?: IntersectionObserver[];
      __passiveItemTransitions?: Transition[];
    }

    const diagnosticWindow = window as DiagnosticWindow;
    const transitions: Transition[] = [];
    const observers: IntersectionObserver[] = [];
    const ids = new WeakMap<Element, number>();
    const observed = new WeakSet<Element>();
    let nextId = 1;
    let lastSnapshotKey = "";

    const getId = (element: Element) => {
      const existing = ids.get(element);
      if (existing) return existing;
      const id = nextId;
      nextId += 1;
      ids.set(element, id);
      return id;
    };

    const serializeRect = (rect: DOMRectReadOnly) => ({
      top: rect.top,
      bottom: rect.bottom,
      width: rect.width,
      height: rect.height,
    });

    const record = (transition: Transition) => {
      if (transitions.length >= 100) return;
      transitions.push(transition);
    };

    const snapshot = (reason: string) => {
      const element = document.querySelector<HTMLElement>(
        '[data-item="Item 1"]',
      );
      if (!element) {
        if (lastSnapshotKey === "missing") return;
        lastSnapshotKey = "missing";
        record({ kind: "snapshot", reason });
        return;
      }
      const id = getId(element);
      const offscreen = element.hasAttribute("data-offscreen");
      const snapshotKey = `${id}:${offscreen}:${element.isConnected}`;
      if (snapshotKey !== lastSnapshotKey) {
        lastSnapshotKey = snapshotKey;
        record({
          kind: "snapshot",
          id,
          reason,
          offscreen,
          connected: element.isConnected,
          rect: serializeRect(element.getBoundingClientRect()),
        });
      }
      if (observed.has(element)) return;
      observed.add(element);
      const root = element.parentElement;
      if (!root) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry) return;
          record({
            kind: "intersection",
            id,
            connected: entry.target.isConnected,
            isIntersecting: entry.isIntersecting,
            intersectionRatio: entry.intersectionRatio,
            rect: serializeRect(entry.boundingClientRect),
          });
        },
        { root, rootMargin: "40%" },
      );
      observers.push(observer);
      observer.observe(element);
    };

    const mutations = new MutationObserver((records) => {
      const reason = records
        .map((record) => record.attributeName || record.type)
        .join(",");
      snapshot(reason);
    });
    mutations.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["data-offscreen"],
    });
    diagnosticWindow.__passiveItemMutationObserver = mutations;
    diagnosticWindow.__passiveItemObservers = observers;
    diagnosticWindow.__passiveItemTransitions = transitions;
    snapshot("start");
  });
}

async function getPassiveItemDiagnostics(page: Page) {
  return page.evaluate(async () => {
    interface DiagnosticWindow extends Window {
      __passiveItemTransitions?: unknown[];
    }

    const element = document.querySelector<HTMLElement>('[data-item="Item 1"]');
    if (!element) throw new Error("Expected Item 1 to be mounted");
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
      transitions: (window as DiagnosticWindow).__passiveItemTransitions,
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
  if (offscreen) await startPassiveItemTransitionLog(page);
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
