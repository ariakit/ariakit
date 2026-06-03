import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  test("unmounts at the longest per-property end time, not max delay + max duration", async ({
    q,
    page,
  }) => {
    const section = q.region("Mixed transition and animation");
    const within = query(section);
    const content = within.text("Animated content");
    const toggle = within.button("Toggle Mixed transition and animation");

    // The content is unmounted while closed.
    await test.expect(content).not.toBeAttached();

    // Open it and wait for the enter transition to settle.
    await toggle.click();
    await test.expect(content).toBeVisible();
    await test.expect(content).toHaveAttribute("data-enter", "true");
    await test.expect(section).toHaveAttribute("data-animating-state", "false");

    // Hide it and measure how long the content stays mounted. The content has a
    // transition (delay 500ms + duration 10ms = ends at 510ms) and a leave
    // animation (delay 0ms + duration 300ms = ends at 300ms), so the longest
    // per-property end time is 510ms. The buggy timeout was max(delays) +
    // max(durations) = 500 + 300 = 800ms, keeping the content mounted ~290ms
    // too long. We measure the unmount delay in the browser because it's the
    // only precise, user-observable signal for "the content stays mounted too
    // long"; Playwright command latency is too coarse to tell 510ms from 800ms.
    const unmountDelay = await page.evaluate(async () => {
      const region = document.querySelector(
        '[aria-label="Mixed transition and animation"]',
      );
      if (!region) throw new Error("Region not found");
      const button = region.querySelector("button");
      if (!button) throw new Error("Toggle button not found");
      return await new Promise<number>((resolve) => {
        let start = 0;
        const observer = new MutationObserver(() => {
          if (!region.querySelector(".content")) {
            observer.disconnect();
            resolve(performance.now() - start);
          }
        });
        observer.observe(region, { childList: true, subtree: true });
        start = performance.now();
        button.click();
      });
    });

    // The content should unmount close to 510ms, not 800ms. 700ms sits well
    // between the two so the assertion fails on the buggy timeout and passes on
    // the fix, with margin for setTimeout/requestAnimationFrame jitter.
    test.expect(unmountDelay).toBeLessThan(700);
    // Sanity check: it still waited for the real animation rather than
    // unmounting immediately.
    test.expect(unmountDelay).toBeGreaterThan(400);

    // The content is unmounted again after the leave animation.
    await test.expect(content).not.toBeAttached();
    await test.expect(section).toHaveAttribute("data-mounted-state", "false");
  });
});
