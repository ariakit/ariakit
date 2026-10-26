import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("skips the filled button until the profile loads", async ({
    page,
    q,
  }) => {
    await test.expect(q.status()).toHaveText("Loading profile");
    // The filled button is the only control in the example.
    await page.keyboard.press("Tab");
    await test.expect(page.locator(":focus")).toHaveCount(0);
    await test.expect(q.status()).toHaveText("Profile loaded");
    await test.expect(q.heading("Maya Chen")).toBeVisible();
    await page.keyboard.press("Tab");
    await test.expect(q.button("Follow")).toBeFocused();
  });
});
