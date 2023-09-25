import type { Locator, Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

type PopupRole = "dialog" | "menu" | "tooltip";

const getButton = (page: Page, name: string) =>
  page.getByRole("button", { name, exact: true });

const getMenuItem = (page: Page | Locator, name: string) =>
  page.getByRole("menuitem", { name, exact: true });

const getPopup = (page: Page, role: PopupRole, name?: string) => {
  return page.getByRole(role, { includeHidden: true, name, exact: !!name });
};

const getAccessiblePopup = (page: Page, role: PopupRole, name?: string) => {
  const isSafari = page.context().browser()?.browserType().name() === "webkit";
  if (isSafari) {
    return page.getByRole(role);
  }
  return page.getByRole(role, { name });
};

const getModal = (page: Page) => getPopup(page, "dialog", "Modal");
const getAccessibleModal = (page: Page) =>
  getAccessiblePopup(page, "dialog", "Modal");

const getTooltip = (page: Page, name?: string) =>
  getPopup(page, "tooltip", name);
const getAccessibleTooltip = (page: Page, name?: string) =>
  getAccessiblePopup(page, "tooltip", name);

const getMenu = (page: Page, name?: string) => getPopup(page, "menu", name);
const getAccessibleMenu = (page: Page, name?: string) =>
  getAccessiblePopup(page, "menu", name);

test.beforeEach(async ({ page }) => {
  await page.goto("/previews/menu-wordpress-modal", {
    waitUntil: "networkidle",
  });
});

for (const menuitem of [
  "Nested",
  "Sibling",
  "Sibling (hideOnClick)",
  "Slot",
  "Slot - Nested",
  "Slot - Sibling",
  "Slot - Sibling (hideOnClick)",
  "Slot (bubblesVirtually)",
  "Slot (bubblesVirtually) - Nested",
  "Slot (bubblesVirtually) - Sibling",
  "Slot (bubblesVirtually) - Sibling (hideOnClick)",
]) {
  const hideOnClick = menuitem.includes("(hideOnClick)");

  test(`interact with modal by clicking on the ${menuitem} menu item with a mouse`, async ({
    page,
  }) => {
    await getButton(page, "Options").click();
    await expect(getAccessibleMenu(page, "Options")).toBeVisible();

    await getMenuItem(page, menuitem).click();
    await expect(getModal(page)).toBeVisible();
    await expect(getModal(page)).toBeFocused();
    await expect(getAccessibleMenu(page, "Options")).not.toBeVisible();
    await expect(getMenu(page, "Options")).toBeVisible({
      visible: !hideOnClick,
    });

    await getButton(page, "Close").hover();
    await expect(getTooltip(page, "Close")).toBeVisible();

    await getButton(page, "Menu").hover();
    await expect(getAccessibleTooltip(page, "Menu")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(getTooltip(page, "Menu")).not.toBeVisible();
    await expect(getModal(page)).toBeVisible();

    await getButton(page, "Menu").click();
    await expect(getAccessibleMenu(page, "Menu")).toBeVisible();
    await expect(getMenu(page, "Menu")).toBeFocused();

    await getMenuItem(page, "Item 3").hover();
    await expect(getAccessibleMenu(page, "Item 3")).toBeVisible();

    await getMenuItem(page, "Item 3.3").hover();
    await expect(getMenu(page, "Item 3")).toBeFocused();

    await getModal(page).click();
    await expect(getAccessibleModal(page)).toBeVisible();
    await expect(getMenu(page, "Menu")).not.toBeVisible();

    await page.mouse.click(10, 10);
    await expect(getModal(page)).not.toBeVisible();
    await expect(getAccessibleMenu(page, "Options")).toBeVisible({
      visible: !hideOnClick,
    });

    if (hideOnClick) return;

    await expect(getMenuItem(page, menuitem)).toBeFocused();

    await page.mouse.click(10, 10);
    await expect(getMenu(page, "Options")).not.toBeVisible();
    await expect(getButton(page, "Options")).toBeFocused();
  });

  test(`interact with modal by clicking on the ${menuitem} menu item with the keyboard`, async ({
    page,
  }) => {
    await getButton(page, "Options").press("Enter");
    await expect(getAccessibleMenu(page, "Options")).toBeVisible();

    await getMenuItem(page, menuitem).press(" ");
    await expect(getModal(page)).toBeVisible();
    await expect(getModal(page)).toBeFocused();
    await expect(getAccessibleMenu(page, "Options")).not.toBeVisible();
    await expect(getMenu(page, "Options")).toBeVisible({
      visible: !hideOnClick,
    });

    await page.keyboard.press("Tab");
    await expect(getTooltip(page, "Close")).toBeVisible();

    await page.keyboard.press("Tab");
    await expect(getAccessibleTooltip(page, "Menu")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(getTooltip(page, "Menu")).not.toBeVisible();
    await expect(getModal(page)).toBeVisible();

    await page.keyboard.press("Enter");
    await expect(getAccessibleMenu(page, "Menu")).toBeVisible();
    await expect(getMenuItem(page, "Item 1")).toBeFocused();

    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowRight");
    await expect(getMenuItem(page, "Item 3.1")).toBeFocused();

    await page.keyboard.press("End");
    await expect(getMenuItem(page, "Item 3.3")).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(getAccessibleModal(page)).toBeVisible();
    await expect(getButton(page, "Menu")).toBeFocused();
    await expect(getMenu(page, "Menu")).not.toBeVisible();
    await expect(getAccessibleTooltip(page, "Menu")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(getTooltip(page, "Menu")).not.toBeVisible();
    await expect(getButton(page, "Menu")).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(getModal(page)).not.toBeVisible();
    await expect(getAccessibleMenu(page, "Options")).toBeVisible({
      visible: !hideOnClick,
    });

    if (hideOnClick) return;

    await expect(getMenuItem(page, menuitem)).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(getMenu(page, "Options")).not.toBeVisible();
    await expect(getButton(page, "Options")).toBeFocused();
  });
}

for (const prefix of [
  // prefixes
  "",
  "Slot - ",
  "Slot (bubblesVirtually) - ",
]) {
  const submenu = `${prefix}Submenu`;
  for (const suffix of [
    "Nested",
    "Sibling",
    "Sibling (hideOnClick)",
    "Submenu",
  ]) {
    const menuitem = `${prefix}${suffix}`;
    const hideOnClick = menuitem.includes("(hideOnClick)");

    test(`interact with modal by clicking on the ${menuitem} menu item`, async ({
      page,
    }) => {
      await getButton(page, "Options").click();
      await getMenuItem(page, submenu).scrollIntoViewIfNeeded();
      await getMenuItem(page, submenu).hover();
      await expect(getMenu(page, "Options")).toBeVisible();
      await expect(getAccessibleMenu(page, submenu)).toBeVisible();

      await getMenuItem(getMenu(page, submenu), menuitem).click();
      await expect(getModal(page)).toBeVisible();
      await expect(getModal(page)).toBeFocused();
      await expect(getAccessibleMenu(page, "Options")).not.toBeVisible();
      await expect(getMenu(page, "Options")).toBeVisible({
        visible: !hideOnClick,
      });
      await expect(getAccessibleMenu(page, submenu)).not.toBeVisible();
      await expect(getMenu(page, submenu)).toBeVisible({
        visible: !hideOnClick,
      });

      await page.keyboard.press("Tab");
      await expect(getTooltip(page, "Close")).toBeVisible();

      await page.keyboard.press("Tab");
      await expect(getAccessibleTooltip(page, "Menu")).toBeVisible();

      await page.keyboard.press("Enter");
      await expect(getAccessibleMenu(page, "Menu")).toBeVisible();
      await expect(getMenuItem(page, "Item 1")).toBeFocused();

      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("ArrowRight");
      await expect(getMenuItem(page, "Item 3.1")).toBeFocused();

      await getModal(page).click();
      await expect(getAccessibleModal(page)).toBeVisible();
      await expect(getMenu(page, "Menu")).not.toBeVisible();

      await page.keyboard.press("Escape");
      await expect(getModal(page)).not.toBeVisible();
      await expect(getAccessibleMenu(page, "Options")).toBeVisible({
        visible: !hideOnClick,
      });
      await expect(getAccessibleMenu(page, submenu)).toBeVisible({
        visible: !hideOnClick,
      });

      if (hideOnClick) return;

      await page.keyboard.press("Escape");
      await expect(getMenu(page, "Options")).not.toBeVisible();
      await expect(getButton(page, "Options")).toBeFocused();
    });
  }
}
