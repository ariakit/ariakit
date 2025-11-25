import { query } from "@ariakit/test/playwright";
import { expect } from "@playwright/test";
import { test } from "examples/test-utils.ts";

test("show/hide by clicking", async ({ page }) => {
  const q = query(page);
  // Open with click
  await q.link("Login").click();
  await expect(page).toHaveURL(/router\/login$/);
  await expect(q.dialog("Login")).toBeVisible();
  await expect(q.textbox("Email")).toBeFocused();
  // Close with Escape
  await page.keyboard.press("Escape");
  await expect(page).toHaveURL(/router$/);
  await expect(q.dialog("Login")).not.toBeVisible();
  await expect(q.link("Login")).toBeFocused();
  // Open with browser back
  await page.goBack();
  await expect(page).toHaveURL(/router\/login$/);
  await expect(q.dialog("Login")).toBeVisible();
  await expect(q.textbox("Email")).toBeFocused();
  // Close by clicking outside
  await page.mouse.click(1, 1);
  await expect(page).toHaveURL(/router$/);
  await expect(q.dialog("Login")).not.toBeVisible();
  await expect(q.link("Login")).toBeFocused();
});

test("show/hide by navigating", async ({ page }) => {
  const q = query(page);
  // Open by navigating to /login
  await page.goto("/previews/dialog-next-router/login");
  await expect(q.dialog("Login")).toBeVisible();
  await expect(q.textbox("Email")).toBeFocused();
  // Close with browser back
  await page.goBack();
  await expect(page).toHaveURL(/router$/);
  await expect(q.dialog("Login")).not.toBeVisible();
  // Open with browser forward
  await page.goForward();
  await expect(page).toHaveURL(/router\/login$/);
  await expect(q.dialog("Login")).toBeVisible();
  await expect(q.textbox("Email")).toBeFocused();
  // Refresh the page
  await page.reload();
  await expect(q.dialog("Login")).toBeVisible();
  await expect(q.textbox("Email")).toBeFocused();
  // Close with form submit
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/router$/);
  await expect(q.dialog("Login")).not.toBeVisible();
  await expect(q.link("Login")).toBeFocused();
});
