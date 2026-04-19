import type { Locator } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

async function getContent(button: Locator) {
  const contentId = await button.getAttribute("aria-controls");
  return button.page().locator(`[id="${contentId}"]`);
}

withFramework(import.meta.dirname, async ({ test }) => {
  test("open @visual", async ({ q, visual }) => {
    await test
      .expect(async () => {
        const button = q.button("Handling User Interactions and Side Effects");
        await button.click();
        await test.expect(await getContent(button)).toBeVisible();
      })
      .toPass();
    await test
      .expect(async () => {
        const button = q.button("Ensuring Accessibility and Semantics");
        await button.scrollIntoViewIfNeeded();
        await button.click();
        await test.expect(await getContent(button)).toBeVisible();
      })
      .toPass();
    await visual();
  });
});
