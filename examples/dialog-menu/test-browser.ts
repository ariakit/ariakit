import type { Page } from "@ariakit/test/playwright";
import { expect, query } from "@ariakit/test/playwright";
import { test } from "../test-utils.ts";

const backdrop = async (page: Page) => {
  const q = query(page);
  const id = await q.dialog().getAttribute("id");
  return page.locator(`[data-backdrop="${id}"]`);
};

test("open/close menu by clicking on menu button", async ({ page }) => {
  const q = query(page);
  await q.button("View recipe").click();
  await q.button("Share").click();
  await expect(q.menu()).toBeVisible();
  await q.button("Share").click();
  await expect(q.menu()).not.toBeVisible();
});

test("dragging the cursor to outside the dialog", async ({ page }) => {
  const q = query(page);
  await q.button("View recipe").click();
  await expect(q.dialog()).toBeVisible();
  await q.dialog().dragTo(await backdrop(page), {
    targetPosition: { x: 0, y: 0 },
  });
  await expect(q.dialog()).toBeVisible();
});

test("dragging the cursor to outside the menu", async ({ page }) => {
  const q = query(page);
  await q.button("View recipe").click();
  await q.button("Share").click();
  await expect(q.dialog()).toBeVisible();
  await expect(q.menu()).toBeVisible();
  await q.menuitem("Facebook").dragTo(q.dialog());
  await expect(q.dialog()).toBeVisible();
  await expect(q.menu()).toBeVisible();
});

test("dragging the cursor to outside both", async ({ page }) => {
  const q = query(page);
  await q.button("View recipe").click();
  await q.button("Share").click();
  await expect(q.dialog()).toBeVisible();
  await expect(q.menu()).toBeVisible();
  await q.menuitem("Facebook").dragTo(await backdrop(page), {
    targetPosition: { x: 0, y: 0 },
  });
  await expect(q.dialog()).toBeVisible();
  await expect(q.menu()).toBeVisible();
});
