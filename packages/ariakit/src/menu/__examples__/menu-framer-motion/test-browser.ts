import { Page, expect, test } from "@playwright/test";

const getMenuButton = (page: Page) =>
  page.getByRole("button", { name: "Options" });

const getMenu = (page: Page) => page.getByRole("menu");

const getMenuItem = (page: Page, name: string) =>
  page.getByRole("menuitem", { name });

const getWrapper = (page: Page) => getMenuButton(page).locator("..");

const createTransition = (duration = 500) => {
  const then = performance.now();
  const isPending = () => {
    const now = performance.now();
    return now - then < duration;
  };
  return isPending;
};

test("open/hide with click", async ({ page, headless }, testInfo) => {
  testInfo.snapshotSuffix = "";
  await page.setViewportSize({ width: 1024, height: 1024 });
  await page.goto("/examples/menu-framer-motion");
  await expect(getMenu(page)).not.toBeVisible();
  const isEntering = createTransition();
  await getMenuButton(page).click();
  await expect(getMenu(page)).toBeVisible();
  if (isEntering()) {
    // The menu button should be focused while the menu is animating.
    await expect(getMenuButton(page)).toBeFocused();
  }
  await expect(getMenu(page)).toBeFocused();
  if (headless) {
    expect(await getWrapper(page).screenshot()).toMatchSnapshot();
  }
  const isLeaving = createTransition();
  await getMenuItem(page, "Report").click();
  if (isLeaving()) {
    await expect(getMenuButton(page)).toBeFocused();
    await expect(getMenu(page)).toBeVisible();
  }
  await expect(getMenu(page)).not.toBeVisible();
});
