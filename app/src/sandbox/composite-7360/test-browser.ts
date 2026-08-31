import type { query } from "@ariakit/test/playwright";
import type { Page } from "@playwright/test";
import { flushFrames, withFramework } from "#app/test-utils/preview.ts";
import { recordScrollEvents } from "#app/test-utils/scroll.ts";

type Query = ReturnType<typeof query>;

withFramework(import.meta.dirname, async ({ test }) => {
  /**
   * Moves the active item with the keyboard. The move is what arms the replay:
   * it leaves a move count behind that a fresh effect instance reads as a focus
   * request to carry out when the toolbar comes back, whether it comes back by
   * mounting again or by becoming a composite again.
   */
  const moveToSecondItem = async (q: Query, page: Page) => {
    await q.button("Bold").click();
    await page.keyboard.press("ArrowRight");
    await test.expect(q.button("Italic")).toBeFocused();
  };

  /** Rests the page at its origin, away from the toolbar at the end. */
  const scrollToTop = async (page: Page) => {
    await page.evaluate(() => window.scrollTo({ top: 0 }));
    await test.expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  };

  const handOffControl = (q: Query) =>
    q.checkbox("Hand off composite behavior");

  /** Hands composite behavior over and rests the page at its origin. */
  const handOff = async (q: Query, page: Page) => {
    await handOffControl(q).click();
    await test.expect(handOffControl(q)).toBeChecked();
    await scrollToTop(page);
  };

  /**
   * Takes composite behavior back and settles the point where a focus or scroll
   * request would land.
   */
  const takeBackAndSettle = async (q: Query, page: Page) => {
    await handOffControl(q).click();
    await test.expect(handOffControl(q)).not.toBeChecked();
    // Same checkpoint as `expandAndSettle`, reached through the `composite`
    // prop instead of a mount.
    await flushFrames(page);
  };

  /**
   * Returns to the controls at the top of the document and collapses the
   * toolbar from there, so the page rests at its origin with the toggle holding
   * focus and the toolbar unmounted.
   */
  const collapseFromTop = async (q: Query, page: Page) => {
    await scrollToTop(page);
    await q.button("Collapse toolbar").click();
    await test.expect(q.toolbar("Formatting")).toBeHidden();
  };

  /**
   * Brings the toolbar back and settles the point where a focus or scroll
   * request would land.
   */
  const expandAndSettle = async (q: Query, page: Page) => {
    await q.button("Expand toolbar").click();
    await test.expect(q.toolbar("Formatting")).toBeVisible();
    // Focus staying put and the page not moving have no positive state to wait
    // on, and the effect that would disturb either runs a commit after the
    // toolbar appears, once its element reaches the store.
    await flushFrames(page);
  };

  // Pins the harness: with no move behind it, nothing in the library asks for
  // focus or a scroll here, so this fails only if mounting the toolbar moves
  // focus or the page on its own.
  test("keeps focus and page position when an untouched toolbar comes back", async ({
    page,
    q,
  }) => {
    await collapseFromTop(q, page);
    const scroll = await recordScrollEvents(page);

    await expandAndSettle(q, page);

    await test.expect(q.button("Collapse toolbar")).toBeFocused();
    test.expect(await page.evaluate(() => window.scrollY)).toBe(0);
    test.expect(await scroll.events()).not.toContain("document");
  });

  // https://github.com/ariakit/ariakit/issues/7360
  test("keeps focus and page position when the toolbar comes back after a move", async ({
    page,
    q,
  }) => {
    await moveToSecondItem(q, page);
    await collapseFromTop(q, page);
    const scroll = await recordScrollEvents(page);

    await expandAndSettle(q, page);

    await test.expect(q.button("Collapse toolbar")).toBeFocused();
    test.expect(await page.evaluate(() => window.scrollY)).toBe(0);
    test.expect(await scroll.events()).not.toContain("document");
  });

  // https://github.com/ariakit/ariakit/issues/7360
  test("keeps focus and page position through repeated remounts", async ({
    page,
    q,
  }) => {
    await moveToSecondItem(q, page);
    await collapseFromTop(q, page);
    const scroll = await recordScrollEvents(page);

    for (let cycle = 0; cycle < 3; cycle += 1) {
      await expandAndSettle(q, page);
      await test.expect(q.button("Collapse toolbar")).toBeFocused();
      await q.button("Collapse toolbar").click();
      await test.expect(q.toolbar("Formatting")).toBeHidden();
    }

    await test.expect(q.button("Expand toolbar")).toBeFocused();
    test.expect(await page.evaluate(() => window.scrollY)).toBe(0);
    test.expect(await scroll.events()).not.toContain("document");
  });

  // The same pin as the control above, for the other way the toolbar comes
  // back: whatever the `composite` prop switching off and on does on its own,
  // it isn't what the tests below observe.
  test("keeps focus and page position when untouched composite behavior comes back", async ({
    page,
    q,
  }) => {
    await handOff(q, page);
    const scroll = await recordScrollEvents(page);

    await takeBackAndSettle(q, page);

    await test.expect(handOffControl(q)).toBeFocused();
    test.expect(await page.evaluate(() => window.scrollY)).toBe(0);
    test.expect(await scroll.events()).not.toContain("document");
  });

  // The sibling request: with an item still active, what gets replayed presents
  // that item instead of the toolbar container. Handing composite behavior over
  // and taking it back remounts the effect without replacing the toolbar
  // element, so this also covers a remount the element itself survives.
  // https://github.com/ariakit/ariakit/issues/7360
  test("keeps focus and page position when composite behavior comes back", async ({
    page,
    q,
  }) => {
    await moveToSecondItem(q, page);
    await handOff(q, page);
    const scroll = await recordScrollEvents(page);

    await takeBackAndSettle(q, page);

    await test.expect(handOffControl(q)).toBeFocused();
    test.expect(await page.evaluate(() => window.scrollY)).toBe(0);
    test.expect(await scroll.events()).not.toContain("document");
  });

  // The other half of that branch: a move recorded while composite behavior is
  // handed off has nothing to carry it out, so it stays pending and its item
  // takes focus once the toolbar is a composite again. The move comes from the
  // arrow key, which still moves the active item meanwhile; only focus stops
  // following it.
  // https://github.com/ariakit/ariakit/issues/7363
  test("focuses a newly moved item when composite behavior comes back", async ({
    page,
    q,
  }) => {
    await moveToSecondItem(q, page);
    await handOffControl(q).click();
    await test.expect(handOffControl(q)).toBeChecked();

    await q.button("Italic").click();
    await page.keyboard.press("ArrowRight");
    await takeBackAndSettle(q, page);

    await test.expect(q.button("Underline")).toBeFocused();
  });

  test("focuses the toolbar when a focus command runs while it is expanded", async ({
    q,
  }) => {
    // Pins the fixture geometry the two `toBeInViewport` assertions rely on: a
    // shorter document would leave the toolbar on screen from the start and
    // make them pass without the library scrolling anything.
    await test.expect(q.toolbar("Formatting")).not.toBeInViewport();

    await q.button("Focus toolbar").click();

    await test.expect(q.toolbar("Formatting")).toBeFocused();
    await test.expect(q.toolbar("Formatting")).toBeInViewport();
  });

  // A move that arrives with no composite element to carry it out stays
  // pending, so the toolbar takes focus once it is back.
  test("focuses the toolbar when a focus command runs while it is collapsed", async ({
    page,
    q,
  }) => {
    await moveToSecondItem(q, page);
    await collapseFromTop(q, page);

    await q.button("Focus toolbar").click();
    await q.button("Expand toolbar").click();

    await test.expect(q.toolbar("Formatting")).toBeFocused();
    await test.expect(q.toolbar("Formatting")).toBeInViewport();
  });

  // The same pending move, but with the toolbar mounted the whole time and only
  // its `composite` prop switching off and back on.
  test("focuses the toolbar when a focus command runs while it is handed off", async ({
    q,
  }) => {
    await handOffControl(q).click();
    await test.expect(handOffControl(q)).toBeChecked();

    await q.button("Focus toolbar").click();
    await handOffControl(q).click();

    await test.expect(handOffControl(q)).not.toBeChecked();
    await test.expect(q.toolbar("Formatting")).toBeFocused();
  });
});
