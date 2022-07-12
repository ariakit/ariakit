import { Locator, Page, expect, test } from "@playwright/test";

const getMenuButton = (locator: Page | Locator) =>
  locator.locator(`role=button[name='Options']`);

const getMenu = (locator: Page | Locator, name: string) =>
  locator.locator(`role=menu[name='${name}']`);

const getMenuWrapper = (locator: Page) =>
  locator.locator("role=menu[name='Options'] >> xpath=..");

const getMenuItem = (
  locator: Page | Locator,
  name: string,
  role = "menuitem"
) => locator.locator(`role=${role}[name='${name}']`);

test("show/hide with click", async ({ page, headless }, testInfo) => {
  testInfo.snapshotSuffix = "";
  await page.goto("/examples/menu-slide");
  await getMenuButton(page).click();
  await expect(getMenu(page, "Options")).toBeVisible();
  const wrapper = await getMenuWrapper(page).elementHandle();
  await getMenuItem(page, "History").click();
  await page.waitForFunction(
    (wrapper) => wrapper?.scrollLeft === wrapper?.clientWidth,
    wrapper
  );
  await expect(getMenu(page, "History")).toBeVisible();
  if (headless) {
    expect(await wrapper?.screenshot()).toMatchSnapshot();
  }
});
