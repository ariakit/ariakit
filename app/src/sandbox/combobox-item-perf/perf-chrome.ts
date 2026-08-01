import type { query } from "@ariakit/test/playwright";
import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { itemParam } from "#app/test-utils/item-perf.ts";
import { gotoAndSettle, withFramework } from "#app/test-utils/preview.ts";

const itemCount = 1000;
const moveCount = 100;
const restoreQuery = "Item 099";
const restoredItem = "Item 1000";

type Query = ReturnType<typeof query>;

function getInput(q: Query) {
  return q.combobox("Search items");
}

function getItemName(itemNumber: number) {
  return `Item ${String(itemNumber).padStart(4, "0")}`;
}

async function openCombobox(q: Query) {
  await getInput(q).click();
  await q.listbox().waitFor({ state: "visible" });
  await q.option(restoredItem).waitFor({ state: "attached" });
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
  await openCombobox(q);
  await page.keyboard.press("ArrowDown");
  await expect(q.option(getItemName(1))).toHaveAttribute("data-active-item");
}

async function moveAcrossItems(page: Page) {
  for (let index = 0; index < moveCount; index += 1) {
    const itemName = getItemName(index + 2);
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

async function setupFilteredItems(q: Query) {
  await openCombobox(q);
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

  test("open combobox", async ({ perf }) => {
    await perf.measure(({ q }) => openCombobox(q), {
      verify: ({ q }) => verifyComboboxOpen(q),
    });
  });

  test("close combobox", async ({ perf }) => {
    await perf.measure(({ page, q }) => closeCombobox(page, q), {
      setup: ({ q }) => openCombobox(q),
      verify: ({ q }) => verifyComboboxClosed(q),
    });
  });

  test("move across items", async ({ perf }) => {
    await perf.measure(({ page }) => moveAcrossItems(page), {
      setup: ({ page, q }) => setupComboboxMovement(page, q),
      verify: ({ q }) => verifyMovedAcrossItems(q),
    });
  });

  test("restore filtered items", async ({ perf }) => {
    await perf.measure(({ page, q }) => restoreFilteredItems(page, q), {
      setup: ({ q }) => setupFilteredItems(q),
      verify: ({ q }) => verifyFilteredItemsRestored(q),
    });
  });
});
