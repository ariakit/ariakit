import { query } from "@ariakit/test/playwright";
import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";
import { visual } from "#app/test-utils/visual.ts";

async function getContent(page: Page) {
  const q = query(page);
  const button = q.button();
  const contentId = await button.getAttribute("aria-controls");
  return page.locator(`[id="${contentId}"]`);
}

withFramework(import.meta.dirname, async () => {
  test("hover @visual", async ({ page }) => {
    const q = query(page);
    await q.button().hover();
    await visual(page);
  });

  test("hide @visual", async ({ page }) => {
    const q = query(page);
    const content = await getContent(page);
    await q.document().click();
    await expect(content).toBeVisible();
    await q.button().click();
    await expect(content).toBeHidden();
    await visual(page);
  });
});
