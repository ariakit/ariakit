import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

const getPopover = (page: Page) => page.getByRole("dialog");
const getButton = (locator: Page | Locator, name?: string) =>
  locator.getByRole("button", { name, exact: true });

test.beforeEach(async ({ page }) => {
  await page.goto("/previews/popover-responsive", { waitUntil: "networkidle" });
});

test("popover responsive", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 480 });
  test.info().snapshotSuffix = "";
  await getButton(page, "Accept invite").click();
  await expect(getPopover(page)).toBeVisible();
  expect(await page.screenshot()).toMatchSnapshot();
  await expect(getButton(getPopover(page), "Accept")).toBeFocused();
  await page.mouse.click(10, 10);
  await expect(getPopover(page)).not.toBeVisible();
  await expect(getButton(page, "Accept invite")).toBeFocused();
  await page.keyboard.press("Enter");
  await page.setViewportSize({ width: 480, height: 768 });
  expect(await page.screenshot()).toMatchSnapshot();
  await expect(getButton(getPopover(page), "Accept")).toBeFocused();
  await page.mouse.click(10, 700);
  await expect(getPopover(page)).not.toBeVisible();
  await expect(getButton(page, "Accept invite")).toBeFocused();
  await page.keyboard.press(" ");
  await expect(getButton(getPopover(page), "Accept")).toBeFocused();
});
