import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

function query(page: Page) {
  return {
    button: () => page.getByRole("combobox", { name: "Favorite food" }),
    listbox: () => page.getByRole("listbox", { name: "Favorite food" }),
    option: (name: string) => page.getByRole("option", { name }),
  };
}

test.describe.configure({ retries: 2 });

test.beforeEach(async ({ page }) => {
  await page.goto("/previews/select-group", { waitUntil: "networkidle" });
});

test("scroll into view", async ({ page }) => {
  test.info().snapshotSuffix = "";
  const q = query(page);
  await q.button().click({ delay: 50 });
  await expect(q.listbox()).toBeFocused();
  for (let i = 0; i < 7; i++) {
    await page.keyboard.press("ArrowDown");
  }
  expect(await q.listbox().screenshot()).toMatchSnapshot();
});

test("scroll into view on open", async ({ page }) => {
  test.info().snapshotSuffix = "";
  const q = query(page);
  await q.button().click();
  await expect(q.option("Chips")).not.toBeInViewport();
  await page.keyboard.type("cc");
  await expect(q.option("Chips")).toBeInViewport();
  await page.keyboard.press("Enter");
  await expect(q.listbox()).not.toBeVisible();
  await page.keyboard.press("Enter");
  await expect(q.option("Chips")).toBeInViewport();
  await q.listbox().evaluate((el) => el.scrollTo({ top: 0 }));
  await page.keyboard.press("Escape");
  await expect(q.listbox()).not.toBeVisible();
  await page.keyboard.press("Enter");
  await expect(q.option("Chips")).toBeInViewport();
  expect(await q.listbox().screenshot()).toMatchSnapshot();
});

test("do not scroll the page when opening the listbox", async ({ page }) => {
  const q = query(page);
  await page.setViewportSize({ width: 800, height: 600 });
  await page.evaluate(() => (document.body.style.paddingTop = "250px"));
  await q.button().click();
  await expect(q.listbox()).toBeVisible();
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  await page.keyboard.press("Escape");
  await expect(q.listbox()).not.toBeVisible();
  await page.evaluate(() => window.scrollTo({ top: 350 }));
  await q.button().click();
  await expect(q.listbox()).toBeVisible();
  expect(await page.evaluate(() => window.scrollY)).toBe(350);
});
