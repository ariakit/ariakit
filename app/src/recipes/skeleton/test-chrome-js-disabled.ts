import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test.use({ javaScriptEnabled: false });

  test("shows the placeholders in the server HTML", async ({ page, q }) => {
    await test.expect(q.status()).toHaveText("Loading profile");
    // The placeholders are hidden from assistive technologies, and only the
    // pending marker tells whether they are painted.
    const parts = page.locator("[aria-busy='true'] [aria-hidden='true']");
    await test.expect(parts).not.toHaveCount(0);
    await test.expect(page.locator("[data-pending]")).toHaveCount(0);
  });

  // https://github.com/ariakit/ariakit/pull/7993#discussion_r4317370417
  test("skips the filled button before hydration", async ({ page }) => {
    // The filled button is the only control in the example.
    await page.keyboard.press("Tab");
    await test.expect(page.locator(":focus")).toHaveCount(0);
  });
});
