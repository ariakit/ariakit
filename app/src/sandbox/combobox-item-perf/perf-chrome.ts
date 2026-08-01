import type { query } from "@ariakit/test/playwright";
import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import {
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
const restoreQuery = "Item 099";
const restoredItem = "Item 1000";

type Query = ReturnType<typeof query>;

function getInput(q: Query) {
  return q.combobox("Search items");
}

function getPopover(page: Page) {
  return page.locator(".popover");
}

function getItemName(itemNumber: number) {
  return `Item ${String(itemNumber).padStart(4, "0")}`;
}

async function openCombobox(page: Page, q: Query) {
  await getInput(q).click();
  await q.listbox().waitFor({ state: "visible" });
  await q.option(restoredItem).waitFor({ state: "attached" });
  await waitForVisibleItems(page, getItemName);
}

async function verifyComboboxOpen(q: Query) {
  await expect(q.option()).toHaveCount(itemCount);
  await expect(q.listbox()).toBeVisible();
  await expect(q.status("Item variant")).toHaveText(itemParam);
}

async function closeCombobox(page: Page, q: Query) {
  await page.keyboard.press("Escape");
  await q.listbox().waitFor({ state: "detached" });
}

async function verifyComboboxClosed(q: Query) {
  await expect(q.option()).toHaveCount(0);
  await expect(getInput(q)).toBeFocused();
}

async function setupComboboxMovement(page: Page, q: Query) {
  await openCombobox(page, q);
  await page.keyboard.press("ArrowDown");
  await expect(q.option(getItemName(1))).toHaveAttribute("data-active-item");
}

async function moveAcrossItems(page: Page) {
  for (let index = 0; index < moveCount; index += 1) {
    const itemName = getItemName(index + 2);
    // Offscreen items only accept a move once they are real items: a press
    // that arrives while the next item is still a placeholder moves nowhere
    // and is dropped. Waiting here keeps every press effective on both sides
    // so the measurement compares the same 100 moves rather than a different
    // number of them.
    await materializedItem(page, itemName).waitFor();
    await page.keyboard.press("ArrowDown");
    await page.locator(`[data-active-item][data-item="${itemName}"]`).waitFor();
  }
}

async function verifyMovedAcrossItems(q: Query) {
  await expect(q.option(getItemName(moveCount + 1))).toHaveAttribute(
    "data-active-item",
  );
  await expect(getInput(q)).toBeFocused();
}

async function setupFilteredItems(page: Page, q: Query) {
  await openCombobox(page, q);
  const input = getInput(q);
  await input.fill(restoreQuery);
  await expect(input).toHaveValue(restoreQuery);
  await expect(q.option()).toHaveCount(10);
  await expect(q.option(restoredItem)).toHaveCount(0);
  await input.selectText();
}

async function restoreFilteredItems(page: Page, q: Query) {
  await page.keyboard.press("Backspace");
  await q.option(restoredItem).waitFor({ state: "attached" });
  await waitForVisibleItems(page, getItemName);
}

async function verifyFilteredItemsRestored(q: Query) {
  await expect(getInput(q)).toHaveValue("");
  await expect(q.option()).toHaveCount(itemCount);
  await expect(q.option(restoredItem)).toBeAttached();
}

withFramework(import.meta.dirname, async ({ test }) => {
  test.beforeEach(async ({ page, q }) => {
    const url = new URL(page.url());
    url.searchParams.set("item", itemParam);
    await gotoAndSettle(page, url.href);
    await expect(q.status("Item variant")).toHaveText(itemParam);
  });

  test(itemTestTitle("open combobox"), async ({ perf }) => {
    await perf.measure(({ page, q }) => openCombobox(page, q), {
      verify: ({ q }) => verifyComboboxOpen(q),
    });
  });

  test(itemTestTitle("close combobox"), async ({ perf }) => {
    await perf.measure(({ page, q }) => closeCombobox(page, q), {
      setup: ({ page, q }) => openCombobox(page, q),
      verify: ({ q }) => verifyComboboxClosed(q),
    });
  });

  test(itemTestTitle("move across items"), async ({ perf }) => {
    await perf.measure(({ page }) => moveAcrossItems(page), {
      setup: ({ page, q }) => setupComboboxMovement(page, q),
      verify: ({ q }) => verifyMovedAcrossItems(q),
    });
  });

  test(itemTestTitle("scroll combobox"), async ({ perf }) => {
    await perf.measure(
      ({ page }) =>
        scrollThroughItems({
          page,
          scroller: getPopover(page),
          getItemName,
        }),
      {
        setup: ({ page, q }) => openCombobox(page, q),
        verify: async ({ page, q }) => {
          await verifyScrolledThroughItems({
            page,
            scroller: getPopover(page),
            getItemName,
          });
          await expect(q.status("Item variant")).toHaveText(itemParam);
        },
      },
    );
  });

  test(itemTestTitle("restore filtered items"), async ({ perf }) => {
    await perf.measure(({ page, q }) => restoreFilteredItems(page, q), {
      setup: ({ page, q }) => setupFilteredItems(page, q),
      verify: ({ q }) => verifyFilteredItemsRestored(q),
    });
  });
});
