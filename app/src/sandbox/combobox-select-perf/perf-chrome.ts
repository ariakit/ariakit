import type { query } from "@ariakit/test/playwright";
import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

const countryCount = 243;
const filteredCountryCount = 5;
const defaultCountry = "Afghanistan";
const firstFilteredCountry = "Tanzania, United Republic of";
const lastCountry = "Zimbabwe";
const searchQuery = "United";
type Query = ReturnType<typeof query>;

function getTrigger(q: Query) {
  return q.combobox("Country");
}

function getSearchInput(q: Query) {
  return q.combobox("Search countries");
}

async function openComboboxSelect(q: Query) {
  await getTrigger(q).click();
  await q.listbox().waitFor({ state: "visible" });
}

async function verifyComboboxSelectOpen(q: Query) {
  await expect(q.listbox()).toBeVisible();
  await expect(getSearchInput(q)).toBeFocused();
  await expect(q.option()).toHaveCount(countryCount);
  await expect(q.option(defaultCountry, { exact: true })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(q.option(defaultCountry, { exact: true })).toHaveAttribute(
    "data-active-item",
  );
}

async function closeComboboxSelect(page: Page, q: Query) {
  await page.keyboard.press("Escape");
  await q.listbox().waitFor({ state: "hidden" });
}

async function verifyComboboxSelectClosed(q: Query) {
  await expect(q.option()).toHaveCount(0);
  await expect(getTrigger(q)).toBeFocused();
}

async function setupItemMovement(q: Query) {
  await openComboboxSelect(q);
  await verifyComboboxSelectOpen(q);
}

async function moveAcrossItems(page: Page) {
  for (let index = 1; index < countryCount; index++) {
    await page.keyboard.press("ArrowDown");
  }
  await page
    .locator("[data-active-item][data-restore-sentinel]")
    .waitFor({ state: "attached" });
}

async function verifyMovedAcrossItems(q: Query) {
  await expect(getSearchInput(q)).toBeFocused();
  await expect(q.option(lastCountry, { exact: true })).toHaveAttribute(
    "data-active-item",
  );
}

async function setupFilteredItems(q: Query) {
  await openComboboxSelect(q);
  const input = getSearchInput(q);
  await input.fill(searchQuery);
  await expect(input).toHaveValue(searchQuery);
  await expect(q.option()).toHaveCount(filteredCountryCount);
  await expect(q.option(firstFilteredCountry, { exact: true })).toHaveAttribute(
    "data-active-item",
  );
  await expect(q.option(lastCountry, { exact: true })).toHaveCount(0);
  await input.selectText();
}

async function restoreFilteredItems(page: Page) {
  await page.keyboard.press("Backspace");
  await page.locator("[data-restore-sentinel]").waitFor({ state: "attached" });
}

async function verifyFilteredItemsRestored(q: Query) {
  await expect(q.listbox()).toBeVisible();
  await expect(getSearchInput(q)).toHaveValue("");
  await expect(getSearchInput(q)).toBeFocused();
  await expect(q.option()).toHaveCount(countryCount);
  await expect(q.option(defaultCountry, { exact: true })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(q.option(lastCountry, { exact: true })).toHaveAttribute(
    "data-restore-sentinel",
  );
}

// Keep this file path, the fixture data, and these test names stable when the
// composed controls are replaced with ComboboxSelect so perf CI can pair them.
withFramework(import.meta.dirname, async ({ test }) => {
  test("open combobox select", async ({ perf }) => {
    await perf.measure(({ q }) => openComboboxSelect(q), {
      verify: ({ q }) => verifyComboboxSelectOpen(q),
    });
  });

  test("close combobox select", async ({ perf }) => {
    await perf.measure(({ page, q }) => closeComboboxSelect(page, q), {
      setup: ({ q }) => openComboboxSelect(q),
      verify: ({ q }) => verifyComboboxSelectClosed(q),
    });
  });

  test("move across items", async ({ perf }) => {
    await perf.measure(({ page }) => moveAcrossItems(page), {
      setup: ({ q }) => setupItemMovement(q),
      verify: ({ q }) => verifyMovedAcrossItems(q),
    });
  });

  test("restore filtered items", async ({ perf }) => {
    await perf.measure(({ page }) => restoreFilteredItems(page), {
      scriptProfile: true,
      profileLimit: 20,
      setup: ({ q }) => setupFilteredItems(q),
      verify: ({ q }) => verifyFilteredItemsRestored(q),
    });
  });
});
