import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/4270
  test("modal menu can be closed through its menu button", async ({
    page,
    q,
  }) => {
    const menuButton = q.button("Preview");

    await menuButton.click();
    await test.expect(q.menu()).toBeVisible();
    await test.expect(q.menu()).toBeFocused();

    // The modal backdrop absorbs pointer events over the menu button, so the
    // keyboard is how a user gets back to the disclosure that has to work as
    // the way out of the menu.
    await page.keyboard.press("Shift+Tab");
    await test.expect(menuButton).toBeFocused();

    await page.keyboard.press("Enter");
    await test.expect(q.menu()).toBeHidden();
  });
});
