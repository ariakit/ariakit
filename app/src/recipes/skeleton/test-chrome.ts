import { isPreviewHydrated } from "#app/lib/preview-hydration.ts";
import { withFramework } from "#app/test-utils/preview.ts";

// The simulated request takes 1.5 seconds.
const LATENCY = 1500;

withFramework(import.meta.dirname, async ({ framework, id, test }) => {
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

  test("fades in the text that replaces a line", async ({ page, q }) => {
    // The paused clock holds the timers that end the reveal, so the fade is
    // still set when the test reads it.
    await page.clock.install();
    await page.clock.pauseAt(Date.now() + 1000);
    await page.goto(`/${framework}/previews/${id}/`);
    await page.waitForFunction(isPreviewHydrated);
    await page.clock.runFor(LATENCY);
    // React schedules the timer that ends the placeholders after a render, and
    // the handle can be in a later row of the reveal, so the clock moves until
    // the handle shows.
    const handle = q.text("@maya");
    await test
      .expect(async () => {
        await page.clock.runFor(10);
        await test.expect(handle).toBeVisible({ timeout: 100 });
      })
      .toPass();
    // The fade is a CSS animation, and no other page state tells whether the
    // text fades in.
    const animationName = await handle.evaluate(
      (element) => getComputedStyle(element).animationName,
    );
    test.expect(animationName).toBe("ui-skeleton-reveal");
  });
});
