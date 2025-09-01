import { query } from "@ariakit/test/playwright";
import { expect, type Page, test } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";
import { screenshot } from "#app/test-utils/screenshot.ts";

async function getContent(page: Page) {
  const q = query(page);
  const button = q.button();
  const contentId = await button.getAttribute("aria-controls");
  return page.locator(`[id="${contentId}"]`);
}

withFramework(import.meta.dirname, async () => {
  test("hover", async ({ page }) => {
    const q = query(page);
    await q.button().hover();
    await screenshot(page);
  });

  test("hide", async ({ page }) => {
    const q = query(page);
    const content = await getContent(page);
    expect(content).toBeVisible();
    await q.button().click();
    expect(content).toBeHidden();
    await screenshot(page);
  });
});
