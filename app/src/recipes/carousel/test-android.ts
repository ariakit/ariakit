import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  test("stops a fast swipe at the next slide", async ({ page, q }) => {
    const carousel = q.region("Tips");
    const viewport = query(carousel).group().first().locator("xpath=..");
    const box = await viewport.boundingBox();
    test.expect(box).not.toBeNull();
    if (!box) return;
    // The selected tab passes through each slide that the swipe scrolls by, so
    // the test waits for the end of the scroll, snap included.
    const scrollEnd = viewport.evaluate(
      (element) =>
        new Promise((resolve) => {
          element.addEventListener("scrollend", resolve, { once: true });
        }),
    );
    // Playwright can tap, but it cannot swipe, so Chrome synthesizes the
    // touches through the Chrome DevTools Protocol, and a fast swipe flings as
    // it would for a person. Half a slide at this speed flings past two more
    // slides without a stop at each one.
    const session = await page.context().newCDPSession(page);
    try {
      await session.send("Input.synthesizeScrollGesture", {
        x: Math.round(box.x + box.width / 2),
        y: Math.round(box.y + box.height / 2),
        xDistance: -Math.round(box.width / 2),
        yDistance: 0,
        speed: 3000,
        gestureSourceType: "touch",
        preventFling: false,
      });
    } finally {
      await session.detach();
    }
    await scrollEnd;
    await test
      .expect(query(carousel).tab("Slide 2"))
      .toHaveAttribute("aria-selected", "true");
  });
});
