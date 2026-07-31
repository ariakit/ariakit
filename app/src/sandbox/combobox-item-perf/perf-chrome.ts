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
const restoreQuery = "Item 099";
const restoredItem = "Item 1000";
const scrollItemNumbers = [200, 400, 600, 800, 1000];
const itemVariant = process.env.PERF_ITEM_VARIANT ?? "base";
const offscreen = itemVariant === "offscreen";

if (itemVariant !== "base" && itemVariant !== "offscreen") {
  throw new Error(`Invalid PERF_ITEM_VARIANT: ${itemVariant}`);
}

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
  if (offscreen) {
    await page.locator("[data-offscreen]").first().waitFor();
    await page
      .locator(`[data-item="${getItemName(1)}"]:not([data-offscreen])`)
      .waitFor();
  }
}

async function verifyComboboxOpen(q: Query) {
  await expect(q.option()).toHaveCount(itemCount);
  await expect(q.listbox()).toBeVisible();
  await expect(q.status("Item variant")).toHaveText(itemVariant);
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
  for (let i = 0; i < moveCount; i += 1) {
    const itemName = getItemName(i + 2);
    await page
      .locator(`[data-item="${itemName}"]:not([data-offscreen])`)
      .waitFor();
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

async function scrollCombobox(page: Page) {
  const popover = getPopover(page);
  for (const itemNumber of scrollItemNumbers) {
    await popover.evaluate(
      (element, scrollTop) => {
        element.scrollTo({ top: scrollTop });
      },
      (itemNumber - 1) * itemSize,
    );
    await flushFrames(page);
    await page
      .locator(`[data-item="${getItemName(itemNumber)}"]:not([data-offscreen])`)
      .waitFor({ state: "attached" });
  }
}

async function verifyComboboxScrolled(page: Page, q: Query) {
  await expect(q.option(restoredItem)).not.toHaveAttribute("data-offscreen");
  await expect
    .poll(() => getPopover(page).evaluate((element) => element.scrollTop))
    .toBeGreaterThan(0);
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
  if (offscreen) {
    await page.locator("[data-offscreen]").first().waitFor();
    await page
      .locator(`[data-item="${getItemName(1)}"]:not([data-offscreen])`)
      .waitFor();
  }
}

async function verifyFilteredItemsRestored(q: Query) {
  await expect(getInput(q)).toHaveValue("");
  await expect(q.option()).toHaveCount(itemCount);
  await expect(q.option(restoredItem)).toBeAttached();
}

withFramework(import.meta.dirname, async ({ test }) => {
  test.beforeEach(async ({ page, q }) => {
    const url = new URL(page.url());
    url.searchParams.set("item", itemVariant);
    await gotoAndSettle(page, url.href);
    await expect(q.status("Item variant")).toHaveText(itemVariant);
  });

  test("open combobox", async ({ perf }) => {
    await perf.measure(({ page, q }) => openCombobox(page, q), {
      verify: ({ q }) => verifyComboboxOpen(q),
    });
  });

  test("close combobox", async ({ perf }) => {
    await perf.measure(({ page, q }) => closeCombobox(page, q), {
      setup: ({ page, q }) => openCombobox(page, q),
      verify: ({ q }) => verifyComboboxClosed(q),
    });
  });

  test("move across items", async ({ perf }) => {
    await perf.measure(({ page }) => moveAcrossItems(page), {
      setup: ({ page, q }) => setupComboboxMovement(page, q),
      verify: ({ q }) => verifyMovedAcrossItems(q),
    });
  });

  test("scroll combobox", async ({ perf }) => {
    await perf.measure(({ page }) => scrollCombobox(page), {
      setup: ({ page, q }) => openCombobox(page, q),
      verify: ({ page, q }) => verifyComboboxScrolled(page, q),
    });
  });

  test("restore filtered items", async ({ perf }) => {
    await perf.measure(({ page, q }) => restoreFilteredItems(page, q), {
      setup: ({ page, q }) => setupFilteredItems(page, q),
      verify: ({ q }) => verifyFilteredItemsRestored(q),
    });
  });
});
