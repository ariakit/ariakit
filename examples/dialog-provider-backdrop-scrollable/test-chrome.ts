import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

const getDialog = (page: Page) =>
  page.getByRole("dialog", { name: "Homemade Cake" });

const getButton = (page: Page, name: string) =>
  page.getByRole("button", { name });

const getBackdrop = (page: Page) => page.locator(".backdrop");

const getBackdropScrollTop = (page: Page) =>
  getBackdrop(page).evaluate((node) => node.scrollTop);

const waitForBackdropScrollTop = async (page: Page, value: number) => {
  const backdrop = await getBackdrop(page).elementHandle();
  await page.waitForFunction(
    ({ backdrop, value }) => backdrop?.scrollTop === value,
    { backdrop, value },
  );
};

test.beforeEach(async ({ page }) => {
  await page.goto("/previews/dialog-backdrop-scrollable", {
    waitUntil: "networkidle",
  });
});

test.use({ headless: false });

test("show/hide", async ({ page }) => {
  const { width } = page.viewportSize()!;
  await expect(getDialog(page)).not.toBeVisible();
  await getButton(page, "View recipe").click();
  await expect(getDialog(page)).toBeVisible();
  // Show scrollbar
  await page.mouse.wheel(0, 10);
  await waitForBackdropScrollTop(page, 10);
  // Drag scrollbar
  await page.mouse.move(width - 5, 40);
  await page.mouse.down();
  await page.mouse.move(width - 5, 200);
  await page.mouse.up();
  const scrollTop = await getBackdropScrollTop(page);
  expect(scrollTop).toBeGreaterThan(200);
  await expect(getDialog(page)).toBeVisible();
  // Hide dialog by clicking on backdrop
  await getBackdrop(page).click({ position: { x: 10, y: 10 } });
  await expect(getDialog(page)).not.toBeVisible();
});
