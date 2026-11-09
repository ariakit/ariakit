import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  test("stops a fast swipe at the next slide", async ({ page, q }) => {
    const carousel = q.region("Tips");
    const viewport = query(carousel).group().first().locator("xpath=..");
    const box = await viewport.boundingBox();
    test.expect(box).not.toBeNull();
    if (!box) return;
    // The selected tab passes through each slide that the swipe scrolls by, so
    // the test waits for the end of the scroll, snap included. The listener is
    // in place before the swipe starts, and an object holds its promise, since
    // the handle of a promise would wait for it.
    const scrollEnd = await viewport.evaluateHandle((element) => ({
      ended: new Promise((resolve) => {
        element.addEventListener("scrollend", resolve, { once: true });
      }),
    }));
    // Playwright can tap, but it cannot swipe, so Chrome receives the touches
    // through the Chrome DevTools Protocol, and a fast swipe flings as it would
    // for a person. Half a slide in a few quick moves flings past two more
    // slides without a stop at each one.
    const session = await page.context().newCDPSession(page);
    const y = Math.round(box.y + box.height / 2);
    const startX = Math.round(box.x + box.width * 0.75);
    const distance = box.width / 2;
    const steps = 6;
    // The fling speed comes from the event times, so each move is 8ms apart.
    const start = Date.now() / 1000;
    try {
      await session.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [{ x: startX, y }],
        timestamp: start,
      });
      for (let step = 1; step <= steps; step++) {
        const x = Math.round(startX - (distance * step) / steps);
        await session.send("Input.dispatchTouchEvent", {
          type: "touchMove",
          touchPoints: [{ x, y }],
          timestamp: start + step * 0.008,
        });
      }
      await session.send("Input.dispatchTouchEvent", {
        type: "touchEnd",
        touchPoints: [],
        timestamp: start + (steps + 1) * 0.008,
      });
    } finally {
      await session.detach();
    }
    // A swipe that doesn't scroll fires no scrollend, so the test checks that
    // it scrolled before it waits for the end.
    await test.expect
      .poll(() => viewport.evaluate((element) => element.scrollLeft))
      .toBeGreaterThan(0);
    await scrollEnd.evaluate(({ ended }) => ended);
    await test
      .expect(query(carousel).tab("Slide 2"))
      .toHaveAttribute("aria-selected", "true");
  });
});
