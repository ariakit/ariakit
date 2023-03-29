import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

const getButton = (page: Page) =>
  page.getByRole("combobox", { name: "Favorite food" });

const getPopover = (page: Page) =>
  page.getByRole("listbox", { name: "Favorite food" });

const repeat = async (fn: () => unknown, count: number) => {
  await [...new Array(count)].reduce((p) => p.then(fn), Promise.resolve());
};

test.beforeEach(async ({ page }) => {
  await page.goto("/previews/select-group");
});

test("scroll into view", async ({ page }) => {
  test.info().snapshotSuffix = "";
  await getButton(page).click();
  await expect(getPopover(page)).toBeFocused();
  await repeat(() => page.keyboard.press("ArrowDown"), 7);
  expect(await getPopover(page).screenshot()).toMatchSnapshot();
});
