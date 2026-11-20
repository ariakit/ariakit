import { flushFrames, withFramework } from "#app/test-utils/preview.ts";
import { hoverTimeout, wheelInFrame } from "./test-helpers.ts";

// The page can't see into a cross-origin frame, so only the mouseout on the way
// into the frame tells that the mouse left the page. Playwright Chrome doesn't
// always send it, so this test runs only in Firefox and Safari.

withFramework(import.meta.dirname, async ({ test, query }) => {
  // https://github.com/ariakit/ariakit/issues/8383
  test("ignore page scrolls while the mouse rests in a cross-origin frame next to the anchors", async ({
    page,
    q,
  }) => {
    const nav = query(q.navigation("Sites"));
    await q.navigation("Sites").scrollIntoViewIfNeeded();
    await wheelInFrame({
      page,
      above: nav.link("Home"),
      below: nav.link("Docs"),
      frame: page.locator("iframe[title='External page']"),
    });
    // The scroll event fires after the wheel resolves, in the next frame.
    await flushFrames(page);
    // A scroll that counted as hover would show the hovercard after the show
    // timeout, which nothing shows while it's pending.
    await page.waitForTimeout(hoverTimeout);
    await test.expect(q.dialog()).toHaveCount(0);
  });
});
