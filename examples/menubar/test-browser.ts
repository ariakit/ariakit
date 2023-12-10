import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

function query(locator: Page | Locator) {
  return {
    menu: (name: string) => locator.getByRole("menu", { name }),
    menuitem: (name: string) => locator.getByRole("menuitem", { name }),
  };
}

test.beforeEach(async ({ page }) => {
  await page.goto("/previews/menubar", { waitUntil: "networkidle" });
});

test("re-open submenu and shift-tab back to the parent menu", async ({
  page,
}) => {
  const q = query(page);
  await q.menuitem("File").click();
  await q.menuitem("Share").hover();
  await q.menuitem("Notes").hover();
  await page.keyboard.press("ArrowLeft");
  await expect(q.menu("Share")).not.toBeVisible();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Shift+Tab");
  await expect(q.menu("File")).toBeVisible();
  await expect(q.menu("Share")).toBeVisible();
  await expect(q.menuitem("Share")).toHaveAttribute("data-active-item");
  await expect(q.menuitem("Email Link")).not.toHaveAttribute(
    "data-active-item",
  );
  await page.keyboard.press("ArrowDown");
  await expect(q.menu("Share")).not.toBeVisible();
  await expect(q.menuitem("Print")).toHaveAttribute("data-active-item");
});
