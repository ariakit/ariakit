import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("controlled open state ignores Escape", async ({ page, q }) => {
    await expect(q.dialog("Success")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(q.dialog("Success")).toBeVisible();
    await expect(q.button("OK")).toBeFocused();
  });

  test("controlled open state ignores outside clicks", async ({ page, q }) => {
    await expect(q.dialog("Success")).toBeVisible();
    await page.mouse.click(1, 1);
    await expect(q.dialog("Success")).toBeVisible();
    await expect(q.button("OK")).toBeFocused();
  });
});
