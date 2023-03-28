import { Locator, Page, expect, test } from "@playwright/test";

const getMenuButton = (locator: Page | Locator) =>
  locator.getByRole("button", { name: "Options" });

const getMenu = (locator: Page | Locator, name: string) =>
  locator.getByRole("menu", { name });

const getMenuWrapper = (locator: Page) =>
  getMenu(locator, "Options").locator("..");

const getMenuItem = (
  locator: Page | Locator,
  name: string,
  role = "menuitem"
) => locator.locator(`role=${role}[name='${name}']`);

test.beforeEach(async ({ page }) => {
  await page.goto("/previews/menu-slide");
});

test("hide with wheel", async ({ page }) => {
  await expect(async () => {
    await getMenuButton(page).click();
    await expect(getMenu(page, "Options")).toBeVisible();
  }).toPass();
  const wrapper = await getMenuWrapper(page).elementHandle();
  await getMenuItem(page, "History").click();
  await page.waitForFunction(
    (wrapper) => wrapper.scrollLeft === wrapper.clientWidth,
    wrapper!
  );
  await page.waitForTimeout(100);
  await getMenuItem(page, "Recently closed tabs").click();
  await page.waitForFunction(
    (wrapper) => wrapper.scrollLeft === wrapper.clientWidth * 2,
    wrapper!
  );
  await page.mouse.wheel(-200, 0);
  await page.waitForFunction(
    (wrapper) => wrapper.scrollLeft === wrapper.clientWidth,
    wrapper!
  );
  await expect(getMenuItem(page, "Recently closed tabs")).toBeFocused();
  await expect(getMenu(page, "Recently closed tabs")).toBeHidden();
  await page.mouse.wheel(-200, 0);
  await page.waitForFunction((wrapper) => wrapper.scrollLeft === 0, wrapper!);
  await expect(getMenuItem(page, "History")).toBeFocused();
  await expect(getMenu(page, "History")).toBeHidden();
});
