import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("shift tab moves focus from modal menu to persistent disclosure", async ({
    page,
    q,
  }) => {
    const menuButton = q.button("Actions");

    await menuButton.click();
    await test.expect(q.menu()).toBeVisible();
    await test.expect(q.menu()).toBeFocused();

    await page.keyboard.press("Shift+Tab");

    await test.expect(menuButton).toBeFocused();
  });
});
