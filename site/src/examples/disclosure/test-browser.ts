import type { Locator } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

async function getContent(button: Locator) {
  const contentId = await button.getAttribute("aria-controls");
  return button.page().locator(`[id="${contentId}"]`);
}

withFramework(import.meta.dirname, async ({ test }) => {
  test("hover @visual", async ({ q, visual }) => {
    await q.button().hover();
    await visual();
  });

  test("hide @visual", async ({ page, q, visual }) => {
    const content = await getContent(q.button());
    await q.document().click();
    await test.expect(content).toBeVisible();
    await q.button().click();
    await test.expect(content).toBeHidden();
    await page.mouse.move(0, 0);
    await visual();
  });
});
