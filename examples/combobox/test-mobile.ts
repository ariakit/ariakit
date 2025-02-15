import { query } from "@ariakit/test/playwright";
import { expect } from "@playwright/test";
import { test } from "../test-utils.ts";

test("show/hide on tap", async ({ page }) => {
  const q = query(page);
  await q.combobox("Your favorite fruit").tap();
  await expect(q.listbox()).toBeVisible();
  await q.document().click({ position: { x: 10, y: 10 } });
  await expect(q.listbox()).not.toBeVisible();
  await expect(q.combobox()).not.toBeFocused();
});

test("hide when tapping on item", async ({ page }) => {
  const q = query(page);
  await q.combobox("Your favorite fruit").tap();
  await q.option("Apple").tap();
  await expect(q.listbox()).not.toBeVisible();
  await expect(q.combobox()).toBeFocused();
});

test("hide when tapping on item after clicking outside", async ({ page }) => {
  const q = query(page);
  await q.combobox().tap();
  await q.document().click({ position: { x: 10, y: 10 } });
  await q.combobox().tap();
  await q.option("Apple").tap();
  await expect(q.listbox()).not.toBeVisible();
  await expect(q.combobox()).toBeFocused();
});
