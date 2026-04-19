import { query } from "@ariakit/test/playwright";
import { expect } from "@playwright/test";
import { test } from "../test-utils.ts";

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
  await expect(q.menuitem("Email Link")).toHaveAttribute("data-active-item");
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
