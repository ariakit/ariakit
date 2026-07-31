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
const moveCount = 100;
const scrollItemNumbers = [200, 400, 600, 800, 1000];
const itemVariant = process.env.PERF_ITEM_VARIANT ?? "base";
const offscreen = itemVariant === "offscreen";

if (itemVariant !== "base" && itemVariant !== "offscreen") {
  throw new Error(`Invalid PERF_ITEM_VARIANT: ${itemVariant}`);
}

type Query = ReturnType<typeof query>;

function getScroller(q: Query) {
  return q.toolbar("Composite items");
}

async function waitForCompositeMounted(page: Page, q: Query) {
  await q.button(`Item ${itemCount}`).waitFor({ state: "attached" });
  if (offscreen) {
    await page.locator("[data-offscreen]").first().waitFor();
    await page.locator('[data-item="Item 1"]:not([data-offscreen])').waitFor();
  }
}

async function mountComposite(page: Page, q: Query) {
  await q.button("Mount composite").click();
  await waitForCompositeMounted(page, q);
}

async function verifyCompositeMounted(q: Query) {
  await expect(q.button(/^Item /)).toHaveCount(itemCount);
  await expect(q.status("Item variant")).toHaveText(itemVariant);
}

async function unmountComposite(q: Query) {
  await q.button("Unmount composite").click();
  await q.button("Item 1", { exact: true }).waitFor({ state: "detached" });
}

async function verifyCompositeUnmounted(q: Query) {
  await expect(q.button(/^Item /)).toHaveCount(0);
}

async function setupCompositeMovement(page: Page, q: Query) {
  await mountComposite(page, q);
  const firstItem = q.button("Item 1", { exact: true });
  await firstItem.focus();
  await expect(firstItem).toBeFocused();
}

async function moveAcrossItems(page: Page) {
  for (let i = 0; i < moveCount; i += 1) {
    const itemNumber = i + 2;
    await page
      .locator(`[data-item="Item ${itemNumber}"]:not([data-offscreen])`)
      .waitFor();
    await page.keyboard.press("ArrowDown");
    await page.waitForFunction((expectedItemNumber) => {
      return (
        document.activeElement?.getAttribute("data-item") ===
        `Item ${expectedItemNumber}`
      );
    }, itemNumber);
  }
}

async function verifyMovedAcrossItems(q: Query) {
  await expect(q.button(`Item ${moveCount + 1}`)).toBeFocused();
}

async function scrollComposite(page: Page, q: Query) {
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

async function verifyCompositeScrolled(q: Query) {
  await expect(q.button(`Item ${itemCount}`)).not.toHaveAttribute(
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

  test("mount composite", async ({ perf }) => {
    await perf.measure(({ page, q }) => mountComposite(page, q), {
      verify: ({ q }) => verifyCompositeMounted(q),
    });
  });

  test("unmount composite", async ({ perf }) => {
    await perf.measure(({ q }) => unmountComposite(q), {
      setup: ({ page, q }) => mountComposite(page, q),
      verify: ({ q }) => verifyCompositeUnmounted(q),
    });
  });

  test("move across items", async ({ perf }) => {
    await perf.measure(({ page }) => moveAcrossItems(page), {
      setup: ({ page, q }) => setupCompositeMovement(page, q),
      verify: ({ q }) => verifyMovedAcrossItems(q),
    });
  });

  test("scroll composite", async ({ perf }) => {
    await perf.measure(({ page, q }) => scrollComposite(page, q), {
      setup: ({ page, q }) => mountComposite(page, q),
      verify: ({ q }) => verifyCompositeScrolled(q),
    });
  });
});
