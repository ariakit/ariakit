import { isPreviewHydrated } from "#app/lib/preview-hydration.ts";
import { withFramework } from "#app/test-utils/preview.ts";

// Placeholders stay for at least 200 ms after they show.
const SKELETON_MIN_DURATION = 200;

withFramework(import.meta.dirname, async ({ framework, id, query, test }) => {
  test("shows the placeholders for a load right after the content", async ({
    page,
    q,
  }) => {
    // The paused clock lets the next load start at the moment the content
    // shows.
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
    // The parts render their children only when the content shows.
    const content = q.text("Late Night Drive");
    const loading = q.checkbox("Loading");
    await loading.click();
    // The placeholders showed on mount and stay for the minimum duration.
    await page.clock.runFor(SKELETON_MIN_DURATION);
    await runClockUntil(async () => (await content.count()) > 0);
    await loading.click();
    await test.expect(content).toHaveCount(0);
    const loadTime = await getNow();
    // The placeholders are hidden from assistive technologies, and only the
    // pending marker tells whether they are painted.
    const pending = page.locator("[data-pending]");
    await runClockUntil(async () => (await pending.count()) === 0);
    // Content has no minimum duration, so the placeholders show within a few
    // clock steps. A minimum on the content would start when the content shows
    // and keep the parts pending for most of the remaining 200 ms.
    const elapsed = (await getNow()) - loadTime;
    test.expect(elapsed).toBeLessThan(SKELETON_MIN_DURATION / 2);
  });

  test("stops the pulse when the content starts to show", async ({
    page,
    q,
  }) => {
    // The paused clock holds the timers that show the next rows of the reveal,
    // so the test can check the area while the reveal runs.
    await page.clock.install();
    await page.clock.pauseAt(Date.now() + 1000);
    await page.goto(`/${framework}/previews/${id}/`);
    await page.waitForFunction(isPreviewHydrated);
    const pulse = q.figure("Pulse");
    // The pulse is a CSS animation on the area, and no other page state tells
    // whether it runs.
    const getPulseCount = () =>
      pulse.evaluate(
        (element) =>
          element
            .getAnimations({ subtree: true })
            .filter(
              (animation) =>
                animation instanceof CSSAnimation &&
                animation.animationName === "pulse",
            ).length,
      );
    await test.expect.poll(getPulseCount).toBe(1);
    await q.checkbox("Loading").click();
    // The placeholders showed on mount and stay for the minimum duration.
    await page.clock.runFor(SKELETON_MIN_DURATION);
    // React schedules each timer after a render, and the title can be in a
    // later row of the reveal, so the clock moves until the title shows.
    await test
      .expect(async () => {
        await page.clock.runFor(10);
        await test
          .expect(query(pulse).text("Late Night Drive"))
          .toBeVisible({ timeout: 100 });
      })
      .toPass();
    // The pulse would fade the content that shows.
    test.expect(await getPulseCount()).toBe(0);
  });
});
