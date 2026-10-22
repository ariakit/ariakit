import { isPreviewHydrated } from "#app/lib/preview-hydration.ts";
import { withFramework } from "#app/test-utils/preview.ts";

// The simulated request takes 1.5 seconds.
const LATENCY = 1500;
// Placeholders stay for at least 200 ms after they show.
const SKELETON_MIN_DURATION = 200;

withFramework(import.meta.dirname, async ({ framework, id, test }) => {
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

  test("shows the placeholders for a reload right after the content", async ({
    page,
    q,
  }) => {
    // The paused clock lets the reload start at the moment the content shows.
    await page.clock.install();
    await page.clock.pauseAt(Date.now() + 1000);
    await page.goto(`/${framework}/previews/${id}/`);
    await page.waitForFunction(isPreviewHydrated);
    const getNow = () => page.evaluate(() => Date.now());
    // React schedules each timer after a render, so advance the clock in steps
    // until the expected state appears.
    const runClockUntil = async (check: () => Promise<boolean>) => {
      await test
        .expect(async () => {
          await page.clock.runFor(10);
          test.expect(await check()).toBe(true);
        })
        .toPass();
    };
    await page.clock.runFor(LATENCY);
    await runClockUntil(async () => (await q.heading("Maya Chen").count()) > 0);
    await q.button("Reload profile").click();
    await test.expect(q.status()).toHaveText("Loading profile");
    const reloadTime = await getNow();
    // The placeholders are hidden from assistive technologies, and only the
    // pending marker tells whether they are painted.
    const pending = page.locator("[data-pending]");
    await runClockUntil(async () => (await pending.count()) === 0);
    // Content has no minimum duration, so the placeholders show within a few
    // clock steps. A minimum on the content would start when the content shows
    // and keep the parts pending for most of the remaining 200 ms.
    const elapsed = (await getNow()) - reloadTime;
    test.expect(elapsed).toBeLessThan(SKELETON_MIN_DURATION / 2);
  });
});
