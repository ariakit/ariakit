import { query } from "@ariakit/test/playwright";
import { expect, type Page, test } from "@playwright/test";
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
    await page.emulateMedia({ reducedMotion: "reduce" });
    const content = await getContent(page);
    expect(content).toBeVisible();
    await q.button().click();
    expect(content).toBeHidden();
    await visual(page);
  });
});
