import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/4291
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

  // The menu button joins the modal context on its own now, so the elements
  // the `getPersistentElements` prop returns have to be kept alongside it.
  // https://github.com/ariakit/ariakit/issues/4270
  test("keeps persistent elements the prop returns", async ({ page, q }) => {
    await q.button("Actions").click();
    await test.expect(q.menu()).toBeVisible();

    await page.keyboard.press("Shift+Tab");
    await test.expect(q.button("Actions")).toBeFocused();

    await page.keyboard.press("Shift+Tab");
    await test.expect(q.button("Refresh")).toBeFocused();
  });
});
