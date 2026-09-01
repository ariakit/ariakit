import type { Page } from "@playwright/test";
import { flushFrames, withFramework } from "#app/test-utils/preview.ts";
import { recordScrollEvents } from "#app/test-utils/scroll.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  /**
   * Moves the active item with the keyboard. The move is what arms the replay:
   * it leaves a move count behind that a fresh effect instance reads as a focus
   * request to carry out when the toolbar comes back, whether it comes back by
   * mounting again or by becoming a composite again.
   */
  const moveToSecondItem = async (page: Page) => {
    const q = query(page);
    await q.button("Bold").click();
    await page.keyboard.press("ArrowRight");
    await test.expect(q.button("Italic")).toBeFocused();
  };

  /** Rests the page at its origin, away from the toolbar at the end. */
  const scrollToTop = async (page: Page) => {
    await page.evaluate(() => window.scrollTo({ top: 0 }));
    await test.expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  };

  const handOffControl = (page: Page) =>
    query(page).checkbox("Hand off composite behavior");

  /** Hands composite behavior over and rests the page at its origin. */
  const handOff = async (page: Page) => {
    await handOffControl(page).click();
    await test.expect(handOffControl(page)).toBeChecked();
    await scrollToTop(page);
  };

  /**
   * Takes composite behavior back and settles the point where a focus or scroll
   * request would land.
   */
  const takeBackAndSettle = async (page: Page) => {
    await handOffControl(page).click();
    await test.expect(handOffControl(page)).not.toBeChecked();
    // Same checkpoint as `expandAndSettle`, reached through the `composite`
    // prop instead of a mount.
    await flushFrames(page);
  };

  /**
   * Returns to the controls at the top of the document and collapses the
   * toolbar from there, so the page rests at its origin with the toggle holding
   * focus and the toolbar unmounted.
   */
  const collapseFromTop = async (page: Page) => {
    const q = query(page);
    await scrollToTop(page);
    await q.button("Collapse toolbar").click();
    await test.expect(q.toolbar("Formatting")).toBeHidden();
  };

  /**
   * Brings the toolbar back and settles the point where a focus or scroll
   * request would land.
   */
  const expandAndSettle = async (page: Page) => {
    const q = query(page);
    await q.button("Expand toolbar").click();
    await test.expect(q.toolbar("Formatting")).toBeVisible();
    // Focus staying put and the page not moving have no positive state to wait
    // on, and the effect that would disturb either runs a commit after the
    // toolbar appears, once its element reaches the store.
    await flushFrames(page);
  };

  /**
   * Asks for a tool that has not loaded yet. The move counts as a request like
   * any other, but nothing can carry it out until the item registers.
   */
  const askForHighlight = async (page: Page) => {
    const q = query(page);
    await scrollToTop(page);
    await q.button("Focus highlight tool").click();
    await test.expect(q.button("Highlight")).toBeHidden();
  };

  const loadHighlight = async (page: Page) => {
    const q = query(page);
    await q.button("Load highlight tool").click();
    await test.expect(q.button("Highlight")).toBeVisible();
  };

  // Pins the harness: with no move behind it, nothing in the library asks for
  // focus or a scroll here, so this fails only if mounting the toolbar moves
  // focus or the page on its own.
  test("keeps focus and page position when an untouched toolbar comes back", async ({
    page,
    q,
  }) => {
    await collapseFromTop(page);
    const scroll = await recordScrollEvents(page);

    await expandAndSettle(page);

    await test.expect(q.button("Collapse toolbar")).toBeFocused();
    test.expect(await page.evaluate(() => window.scrollY)).toBe(0);
    test.expect(await scroll.events()).not.toContain("document");
  });

  // https://github.com/ariakit/ariakit/issues/7360
  test("keeps focus and page position when the toolbar comes back after a move", async ({
    page,
    q,
  }) => {
    await moveToSecondItem(page);
    await collapseFromTop(page);
    const scroll = await recordScrollEvents(page);

    await expandAndSettle(page);

    await test.expect(q.button("Collapse toolbar")).toBeFocused();
    test.expect(await page.evaluate(() => window.scrollY)).toBe(0);
    test.expect(await scroll.events()).not.toContain("document");
  });

  // https://github.com/ariakit/ariakit/issues/7360
  test("keeps focus and page position through repeated remounts", async ({
    page,
    q,
  }) => {
    await moveToSecondItem(page);
    await collapseFromTop(page);
    const scroll = await recordScrollEvents(page);

    for (let cycle = 0; cycle < 3; cycle += 1) {
      await expandAndSettle(page);
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
  }) => {
    await handOff(page);
    const scroll = await recordScrollEvents(page);

    await takeBackAndSettle(page);

    await test.expect(handOffControl(page)).toBeFocused();
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
  }) => {
    await moveToSecondItem(page);
    await handOff(page);
    const scroll = await recordScrollEvents(page);

    await takeBackAndSettle(page);

    await test.expect(handOffControl(page)).toBeFocused();
    test.expect(await page.evaluate(() => window.scrollY)).toBe(0);
    test.expect(await scroll.events()).not.toContain("document");
  });

  // The other half of that branch: a move recorded while composite behavior is
  // handed off has nothing to carry it out, so it stays pending and its item
  // takes focus once the toolbar is a composite again. The move comes from the
  // arrow key, which still moves the active item meanwhile; only focus stops
  // following it.
  // Related: https://github.com/ariakit/ariakit/issues/7363
  test("focuses a newly moved item when composite behavior comes back", async ({
    page,
    q,
  }) => {
    await moveToSecondItem(page);
    await handOffControl(page).click();
    await test.expect(handOffControl(page)).toBeChecked();

    await q.button("Italic").click();
    await page.keyboard.press("ArrowRight");
    await takeBackAndSettle(page);

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
    await moveToSecondItem(page);
    await collapseFromTop(page);

    await q.button("Focus toolbar").click();
    await q.button("Expand toolbar").click();

    await test.expect(q.toolbar("Formatting")).toBeFocused();
    await test.expect(q.toolbar("Formatting")).toBeInViewport();
  });

  // The same pending move, but with the toolbar mounted the whole time and only
  // its `composite` prop switching off and back on.
  test("focuses the toolbar when a focus command runs while it is handed off", async ({
    page,
    q,
  }) => {
    await handOffControl(page).click();
    await test.expect(handOffControl(page)).toBeChecked();

    await q.button("Focus toolbar").click();
    await handOffControl(page).click();

    await test.expect(handOffControl(page)).not.toBeChecked();
    await test.expect(q.toolbar("Formatting")).toBeFocused();
  });

  // Pins the third kind of pending move, the one waiting on its item rather
  // than on the toolbar: with nothing replacing the toolbar meanwhile, the
  // request is carried out when the tool loads.
  test("focuses a tool that loads after being asked for", async ({
    page,
    q,
  }) => {
    await askForHighlight(page);

    await loadHighlight(page);

    await test.expect(q.button("Highlight")).toBeFocused();
    await test.expect(q.button("Highlight")).toBeInViewport();
  });

  // The third thing a pending move can do: be given up on. Picking another tool
  // makes the toolbar abandon the request for the one that never arrived, and a
  // request it gave up on is spent rather than still waiting, so it is not left
  // behind for a later instance to carry out.
  // https://github.com/ariakit/ariakit/issues/7360
  test("keeps focus and page position when composite behavior comes back after an abandoned request", async ({
    page,
    q,
  }) => {
    await askForHighlight(page);
    await q.button("Bold").click();
    await test.expect(q.button("Bold")).toBeFocused();
    await handOff(page);
    const scroll = await recordScrollEvents(page);

    await takeBackAndSettle(page);

    await test.expect(handOffControl(page)).toBeFocused();
    test.expect(await page.evaluate(() => window.scrollY)).toBe(0);
    test.expect(await scroll.events()).not.toContain("document");
  });

  // The same pending move, across the handoff that replaces what would carry it
  // out. Only the handoff is exercised here: collapsing also points the store
  // at the toolbar container, which retires the request instead of leaving it
  // pending.
  test("focuses a tool that loads after composite behavior comes back", async ({
    page,
    q,
  }) => {
    await askForHighlight(page);
    await handOff(page);
    await takeBackAndSettle(page);

    await loadHighlight(page);

    await test.expect(q.button("Highlight")).toBeFocused();
    await test.expect(q.button("Highlight")).toBeInViewport();
  });
});
