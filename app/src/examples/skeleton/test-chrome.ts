import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("skips the filled button until the profile loads", async ({
    page,
    q,
  }) => {
    await test.expect(q.status()).toHaveText("Loading profile");
    await page.keyboard.press("Tab");
    await test.expect(q.button("Reload profile")).toBeFocused();
    await test.expect(q.status()).toHaveText("Loading profile");
    await test.expect(q.status()).toHaveText("Profile loaded");
    await test.expect(q.heading("Maya Chen")).toBeVisible();
    await page.keyboard.press("Shift+Tab");
    await test.expect(q.button("Follow")).toBeFocused();
  });

  test("hides the previous profile while it reloads", async ({ q }) => {
    await test.expect(q.heading("Maya Chen")).toBeVisible();
    await q.button("Reload profile").click();
    await test.expect(q.status()).toHaveText("Loading profile");
    await test.expect(q.heading("Maya Chen")).toHaveCount(0);
    await test.expect(q.button("Follow")).toHaveCount(0);
    await test.expect(q.heading("Maya Chen")).toBeVisible();
    await test.expect(q.button("Follow")).toBeVisible();
  });
});
