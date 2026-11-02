import { flushFrames, withFramework } from "#app/test-utils/preview.ts";
import {
  hoverPastShowTimeout,
  SHOW_TIMEOUT,
  watchOpening,
} from "#app/test-utils/tooltip.ts";

const LONG_NAME = "Design review notes for the new onboarding flow";

withFramework(import.meta.dirname, async ({ test }) => {
  test("keeps focus on a link when a resize changes if it cuts its text off", async ({
    page,
    q,
  }) => {
    const section = q.region("Recent documents");
    const link = q.link(LONG_NAME);
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await test.expect(link).toBeFocused();
    await test.expect(q.tooltip(LONG_NAME)).toBeVisible();
    // The example has a fixed width, so the test widens it, as a layout that
    // fits its container would.
    await section.evaluate((element) => {
      element.style.width = "60rem";
    });
    await test.expect
      .poll(() => link.evaluate((el) => el.scrollWidth > el.clientWidth))
      .toBe(false);
    // The link measures itself in a ResizeObserver callback, and no state shows
    // that the callback has run, so the test crosses the frames that deliver it
    // and the React commit that follows.
    await flushFrames(page);
    await test.expect(link).toBeFocused();
    await test.expect(q.tooltip()).toHaveCount(0);
    await section.evaluate((element) => {
      element.style.width = "";
    });
    await test.expect
      .poll(() => link.evaluate((el) => el.scrollWidth > el.clientWidth))
      .toBe(true);
    // The same callback runs again now that the text is cut off.
    await flushFrames(page);
    await test.expect(link).toBeFocused();
    // The tooltip stays closed until the next focus or hover.
    await test.expect(q.tooltip()).toHaveCount(0);
  });

  test("shows the full text of a link that cuts it off", async ({ q }) => {
    const link = q.link(LONG_NAME);
    // Ariakit resets hover intent on scroll, so the anchor must be in view
    // before the pointer moves over it.
    await link.scrollIntoViewIfNeeded();
    await link.hover();
    await test.expect(q.tooltip(LONG_NAME)).toBeVisible();
  });

  test("has no tooltip for a link that shows all of its text", async ({
    page,
    q,
  }) => {
    await page.keyboard.press("Tab");
    await test.expect(q.link("Roadmap")).toBeFocused();
    await hoverPastShowTimeout(page, q.link("Roadmap"));
    await test.expect(q.tooltip()).toHaveCount(0);
  });

  // Focus and hover on a link without a tooltip must not open a tooltip that
  // the next tooltip skips its delay for.
  test("keeps the show delay after a link without a tooltip", async ({
    page,
    q,
  }) => {
    const link = q.link(LONG_NAME);
    // Ariakit resets hover intent on scroll, so the anchor must be in view
    // before the pointer moves over it.
    await link.scrollIntoViewIfNeeded();
    const opening = await watchOpening(link, LONG_NAME);
    // The hover must come within the 300ms that a closed tooltip stays active,
    // so the focus check waits until after it.
    await page.keyboard.press("Tab");
    await link.hover();
    await test.expect(q.link("Roadmap")).toBeFocused();
    const { delay } = await opening();
    test.expect(delay).toBeGreaterThanOrEqual(SHOW_TIMEOUT);
  });
});
