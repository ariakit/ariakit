import type { query } from "@ariakit/test/playwright";
import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import {
  comparesOffscreenItems,
  getItemName,
  itemParam,
  itemTestTitle,
  materializedItem,
  scrollThroughItems,
  verifyScrolledThroughItems,
  waitForVisibleItems,
} from "#app/test-utils/offscreen-item-perf.ts";
import { gotoAndSettle, withFramework } from "#app/test-utils/preview.ts";

const itemCount = 1000;
const moveCount = 100;

type Query = ReturnType<typeof query>;

function getScroller(q: Query) {
  return q.toolbar("Composite items");
}

async function mountComposite(page: Page, q: Query) {
  await q.button("Mount composite").click();
  await q.button(getItemName(itemCount)).waitFor({ state: "attached" });
  await waitForVisibleItems(page, getItemName);
}

async function verifyCompositeMounted(q: Query) {
  await expect(q.button(/^Item /)).toHaveCount(itemCount);
  await expect(q.status("Item variant")).toHaveText(itemParam);
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
  for (let index = 0; index < moveCount; index += 1) {
    const itemNumber = index + 2;
    // Offscreen items only accept a move once they are real items: a press
    // that arrives while the next item is still a placeholder moves nowhere
    // and is dropped. Waiting here keeps every press effective on both sides
    // so the measurement compares the same 100 moves rather than a different
    // number of them.
    await materializedItem(page, getItemName(itemNumber)).waitFor();
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
  await expect(q.button(getItemName(moveCount + 1))).toBeFocused();
}

withFramework(import.meta.dirname, async ({ test }) => {
  test.beforeEach(async ({ page, q }) => {
    const url = new URL(page.url());
    url.searchParams.set("item", itemParam);
    await gotoAndSettle(page, url.href);
    await expect(q.status("Item variant")).toHaveText(itemParam);
  });

  test(itemTestTitle("mount composite"), async ({ perf }) => {
    await perf.measure(({ page, q }) => mountComposite(page, q), {
      verify: ({ q }) => verifyCompositeMounted(q),
    });
  });

  test(itemTestTitle("unmount composite"), async ({ perf }) => {
    await perf.measure(({ q }) => unmountComposite(q), {
      setup: ({ page, q }) => mountComposite(page, q),
      verify: ({ q }) => verifyCompositeUnmounted(q),
    });
  });

  test(itemTestTitle("move across items"), async ({ perf }) => {
    await perf.measure(({ page }) => moveAcrossItems(page), {
      setup: ({ page, q }) => setupCompositeMovement(page, q),
      verify: ({ q }) => verifyMovedAcrossItems(q),
    });
  });

  // Only offscreen items do work while scrolling, so this stays out of the
  // version comparison, where both sides would measure harness overhead.
  if (comparesOffscreenItems) {
    test(itemTestTitle("scroll composite"), async ({ perf }) => {
      await perf.measure(
        ({ page, q }) =>
          scrollThroughItems({ page, scroller: getScroller(q), getItemName }),
        {
          setup: ({ page, q }) => mountComposite(page, q),
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
