import { Page, expect, test } from "@playwright/test";

const getButton = (page: Page) =>
  page.locator("role=combobox[name='Favorite food']");

const getPopover = (page: Page) =>
  page.locator(`role=listbox[name='Favorite food']`);

const repeat = async (fn: () => unknown, count: number) => {
  await [...new Array(count)].reduce((p) => p.then(fn), Promise.resolve());
};

test("scroll into view", async ({ page, headless }, testInfo) => {
  testInfo.snapshotSuffix = "";
  await page.goto("/examples/select-group");
  await getButton(page).click();
  await expect(getPopover(page)).toBeFocused();
  await repeat(() => page.keyboard.press("ArrowDown"), 7);
  if (headless) {
    expect(await getPopover(page).screenshot()).toMatchSnapshot();
  }
});
