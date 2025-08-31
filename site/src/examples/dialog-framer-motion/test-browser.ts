import { query } from "@ariakit/test/playwright";
import { expect, test } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";
import { screenshot } from "#app/test-utils/screenshot.ts";

withFramework(import.meta.dirname, async () => {
  test("open dialog", async ({ page }) => {
    const q = query(page);
    await screenshot(page);
    await q.button("Show modal").click();
    await expect(q.dialog()).toBeVisible();
    await expect(q.dialog()).toHaveCSS("opacity", "1");
    await screenshot(page);
  });
});
