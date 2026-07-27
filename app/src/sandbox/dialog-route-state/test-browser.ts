import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("link opens and dismisses the route dialog with pointer input", async ({
    page,
    q,
  }) => {
    const disclosure = page.locator('a[href="/post"]');
    await expect(q.dialog("Post")).not.toBeAttached();
    await disclosure.click();
    await expect(q.dialog("Post")).toBeVisible();
    await expect(q.textbox()).toBeFocused();
    await q.link("Dismiss popup").click();
    await expect(q.dialog("Post")).not.toBeAttached();
    await expect(disclosure).toBeFocused();
  });

  test("dismiss link works with keyboard input", async ({ page, q }) => {
    const disclosure = page.locator('a[href="/post"]');
    await disclosure.click();
    await expect(q.textbox()).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(q.link("Dismiss popup")).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(q.dialog("Post")).not.toBeAttached();
    await expect(disclosure).toBeFocused();
  });

  test("Escape restores focus to the route link", async ({ page, q }) => {
    const disclosure = page.locator('a[href="/post"]');
    await disclosure.click();
    await page.keyboard.press("Escape");
    await expect(q.dialog("Post")).not.toBeAttached();
    await expect(disclosure).toBeFocused();
  });

  test("outside dismissal restores focus to the route link", async ({
    page,
    q,
  }) => {
    const disclosure = page.locator('a[href="/post"]');
    await disclosure.click();
    await page.mouse.click(1, 1);
    await expect(q.dialog("Post")).not.toBeAttached();
    await expect(disclosure).toBeFocused();
  });

  test("form submission closes the route dialog", async ({ page, q }) => {
    const disclosure = page.locator('a[href="/post"]');
    await disclosure.click();
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");
    await expect(q.dialog("Post")).not.toBeAttached();
    await expect(disclosure).toBeFocused();
  });
});
