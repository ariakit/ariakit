import { withFramework } from "#app/test-utils/preview.ts";

// Without JavaScript, the page keeps the server markup.
withFramework(import.meta.dirname, async ({ test }) => {
  test.use({ javaScriptEnabled: false });

  test("renders button radios with a radio role before hydration", async ({
    page,
  }) => {
    await test.expect(page.locator('button[type="radio"]')).toHaveCount(0);
    // Some radios sit in closed panels, so this does not query by role.
    await test
      .expect(page.locator('button[role="radio"]').first())
      .toBeAttached();
  });
});
