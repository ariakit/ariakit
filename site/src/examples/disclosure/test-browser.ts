import { query } from "@ariakit/test/playwright";
import { expect, test } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";
import { screenshot } from "#app/test-utils/screenshot.ts";

withFramework(import.meta.dirname, async () => {
  test("hover", async ({ page }) => {
    const q = query(page);
    await q.button().hover();
    await screenshot(page);
  });

  test("hide", async ({ page }) => {
    const q = query(page);
    const button = q.button();
    const contentId = await button.getAttribute("aria-controls");
    const content = page.locator(`[id="${contentId}"]`);
    expect(content).toBeVisible();
    await q.button().click();
    expect(content).toBeHidden();
    await screenshot(page);
  });
});
