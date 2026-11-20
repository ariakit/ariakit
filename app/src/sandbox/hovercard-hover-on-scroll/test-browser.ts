import { flushFrames, withFramework } from "#app/test-utils/preview.ts";
import { hoverTimeout, wheelInFrame, wheelTo } from "./test-helpers.ts";

// Half of the default show timeout. A hovercard that closed and opened again
// would take the whole show timeout.
const midwayToShowTimeout = hoverTimeout / 2;

withFramework(import.meta.dirname, async ({ test, query }) => {
  // Without hoverOnScroll, Playwright WebKit closes this hovercard when the old
  // anchor scrolls out and opens it again on the next anchor after the show
  // timeout, so this test runs in every engine.
  test("move the hovercard without closing it when the old anchor scrolls out", async ({
    page,
    q,
  }) => {
    const nav = query(q.navigation("Components"));
    // Ariakit resets hover intent on scroll, so the list must be in view before
    // the pointer moves to it.
    await q.navigation("Components").scrollIntoViewIfNeeded();
    await nav.link("Select").hover();
    await test.expect(q.dialog("Select")).toBeVisible();
    await wheelTo(page, nav.link("Select"), nav.link("Tab"));
    await test.expect(nav.link("Select")).not.toBeInViewport();
    // The position update of the old anchor runs on the scroll event, and a
    // close would render in the next frame.
    await flushFrames(page);
    // A hovercard that closed would be hidden until it opened again after the
    // show timeout, so it must be open on the new anchor within half of it.
    await test
      .expect(q.dialog("Tab"))
      .toHaveAttribute("data-open", { timeout: midwayToShowTimeout });
  });

  // https://github.com/ariakit/ariakit/issues/8383
  test("ignore page scrolls while the mouse rests in a frame next to the anchors", async ({
    page,
    q,
  }) => {
    const nav = query(q.navigation("Pages"));
    await q.navigation("Pages").scrollIntoViewIfNeeded();
    await wheelInFrame({
      page,
      above: nav.link("Home"),
      below: nav.link("Docs"),
      frame: page.locator("iframe[title='Embedded page']"),
    });
    // The scroll event fires after the wheel resolves, in the next frame.
    await flushFrames(page);
    // A scroll that counted as hover would show the hovercard after the show
    // timeout, which nothing shows while it's pending.
    await page.waitForTimeout(hoverTimeout);
    await test.expect(q.dialog()).toHaveCount(0);
  });
});
