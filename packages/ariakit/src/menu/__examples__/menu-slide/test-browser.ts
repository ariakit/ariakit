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
    (wrapper) => wrapper.scrollLeft === wrapper.clientWidth,
    wrapper!
  );
  await expect(getMenu(page, "History")).toBeVisible();
  if (headless) {
    expect(await wrapper?.screenshot()).toMatchSnapshot();
  }
  await page.waitForTimeout(500);
  await getMenuItem(page, "Recently closed windows").click();
  await page.waitForFunction(
    (wrapper) => wrapper.scrollLeft === wrapper.clientWidth * 2,
    wrapper!
  );
  await getMenuItem(
    getMenu(page, "Recently closed windows"),
    "Back to parent menu"
  ).click();
  await expect(getMenu(page, "Recently closed windows")).toBeHidden();
  await getMenuItem(getMenu(page, "History"), "Back to parent menu").click();
  await page.waitForFunction((wrapper) => wrapper.scrollLeft === 0, wrapper!);
  await expect(getMenu(page, "History")).toBeHidden();
});

test("show/hide with keyboard", async ({ page }) => {
  await page.goto("/examples/menu-slide");
  await getMenuButton(page).focus();
  await page.keyboard.press("ArrowDown");
  await expect(getMenuItem(page, "New Tab")).toBeFocused();
  const wrapper = await getMenuWrapper(page).elementHandle();
  await page.keyboard.type("h");
  await page.keyboard.press("Enter");
  await page.waitForFunction(
    (wrapper) => wrapper.scrollLeft === wrapper.clientWidth,
    wrapper!
  );
  await expect(
    getMenuItem(getMenu(page, "History"), "Back to parent menu")
  ).toBeFocused();
  await page.keyboard.type("rr");
  await page.waitForTimeout(500);
  await page.keyboard.press("ArrowRight");
  await page.waitForFunction(
    (wrapper) => wrapper.scrollLeft === wrapper.clientWidth * 2,
    wrapper!
  );
  await page.keyboard.press(" ");
  await page.waitForFunction(
    (wrapper) => wrapper.scrollLeft === wrapper.clientWidth,
    wrapper!
  );
});
