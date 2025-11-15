import { query } from "@ariakit/test/playwright";
import { expect, test } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";
import { visual } from "#app/test-utils/visual.ts";

withFramework(import.meta.dirname, async () => {
  test("open dialog @visual", async ({ page }) => {
    const q = query(page);
    await visual(page);
    await q.button("Show modal").click();
    await expect(q.dialog()).toBeVisible();
    await expect(q.dialog()).toHaveCSS("opacity", "1");
    await visual(page);
  });
});
