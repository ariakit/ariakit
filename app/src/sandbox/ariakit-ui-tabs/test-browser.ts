import type { Locator } from "@playwright/test";
import {
  captureInView,
  capturePage,
  expectFocusVisible,
  forEachColorScheme,
  forEachColorSchemeOf,
  getCapture,
  hoverOver,
  tabTo,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

withCaptures(import.meta.dirname, async ({ query, test }) => {
  test("page @visual", async ({ page, visual }) => {
    await forEachColorScheme(page, (colorScheme) =>
      capturePage({ page, visual, colorScheme, item: "ariakit-ui-tabs/page" }),
    );
  });

  // A negative distance puts the bar over its tab, so the bar inverts from the
  // tab instead of the tab list.
  test("paints a bar over its tab @visual", async ({ page, q, visual }) => {
    for (const contrast of ["no-preference", "more"] as const) {
      await page.emulateMedia({ contrast });
      await forEachColorSchemeOf(
        page,
        ["Bar placement"],
        async (colorScheme) => {
          const distance = q.combobox("Tab bar distance");
          await distance.selectOption("-3px");
          await test.expect(distance).toHaveValue("-3px");
          await captureInView({
            visual,
            box: q.article("Bar placement"),
            colorScheme,
            item: "ariakit-ui-tabs/bar-over-tab",
          });
        },
      );
    }
  });

  test("paints the hover pill on a hovered tab @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorSchemeOf(page, ["Folder tabs"], async (colorScheme) => {
      const box = q.article("Folder tabs");
      // A synthesized pointer move that scrolls the strip into view does not
      // apply :hover in WebKit until the pointer enters another element, so the
      // pointer passes over Usage on its way to Preview.
      await query(box).tab("Usage").hover();
      await hoverOver(query(box).tab("Preview"));
      await visual(
        getCapture(box, colorScheme, { item: "ariakit-ui-tabs/hovered-tab" }),
      );
    });
  });

  test("paints the focus pill on a tab without selecting it @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorSchemeOf(page, ["Folder tabs"], async (colorScheme) => {
      const box = q.article("Folder tabs");
      const usage = query(box).tab("Usage");
      // Firefox leaves the modality of a click in place when an arrow key moves
      // focus, so the strip is reached with the keyboard.
      await tabTo(page, query(box).tab("Code"));
      await page.keyboard.press("ArrowRight");
      await expectFocusVisible(usage);
      await test.expect(usage).toHaveAttribute("aria-selected", "false");
      await captureInView({
        visual,
        box,
        colorScheme,
        item: "ariakit-ui-tabs/focused-tab",
      });
    });
  });

  // The root edge cuts the curve of the selected first tab. The focus edge
  // thickens the tab sides, so the side border that closes the cut thickens
  // with them.
  test("paints the focus edge along a cut folder curve @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorSchemeOf(page, ["With padding"], async (colorScheme) => {
      const box = q.article("With padding");
      const preview = query(box).tab("Preview");
      await tabTo(page, preview);
      await expectFocusVisible(preview);
      await test.expect(preview).toHaveAttribute("aria-selected", "true");
      await captureInView({
        visual,
        box,
        colorScheme,
        item: "ariakit-ui-tabs/focused-cut-folder-tab",
      });
    });
  });

  // Focus kept the selected offset of flat and bevel tabs, so the brand fill
  // fell under 3:1 against a dark strip, also while hovered. Without the
  // offset, a selected push alone lightens the fill under 3:1 in light mode.
  // https://github.com/ariakit/ariakit/issues/8101
  test("removes the selected lift from a focused tab @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorSchemeOf(
      page,
      ["Bar placement", "Flat tabs"],
      async (colorScheme) => {
        const placement = q.article("Bar placement");
        const pushed = query(placement).tab("Preview");
        // Firefox makes this overflowing strip a tab stop, and focusing it
        // clears the active tab, so the Tab back from it would skip the tabs.
        // Arrow keys reach the tab with the keyboard.
        await pushed.focus();
        await page.keyboard.press("ArrowRight");
        await page.keyboard.press("ArrowLeft");
        await expectFocusVisible(pushed);
        await test.expect(pushed).toHaveAttribute("aria-selected", "true");
        await captureInView({
          visual,
          box: placement,
          colorScheme,
          item: "ariakit-ui-tabs/focused-pushed-tab",
        });
        const box = q.article("Flat tabs");
        const code = query(box).tab("Code");
        await tabTo(page, code);
        await expectFocusVisible(code);
        await test.expect(code).toHaveAttribute("aria-selected", "true");
        await captureInView({
          visual,
          box,
          colorScheme,
          item: "ariakit-ui-tabs/focused-selected-tab",
        });
        await hoverOver(code);
        await visual(
          getCapture(box, colorScheme, {
            item: "ariakit-ui-tabs/focused-hovered-selected-tab",
          }),
        );
      },
    );
  });

  // The hover offset darkened the brand fill of a focused unselected flat tab
  // under 3:1 against a dark strip.
  // https://github.com/ariakit/ariakit/issues/8111
  test("keeps the focus fill of a hovered unselected tab @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorSchemeOf(
      page,
      ["Flat tabs without select on move"],
      async (colorScheme) => {
        const box = q.article("Flat tabs without select on move");
        const usage = query(box).tab("Usage");
        await hoverOver(usage);
        await tabTo(page, query(box).tab("Code"));
        await page.keyboard.press("ArrowRight");
        await expectFocusVisible(usage);
        await test.expect(usage).toHaveAttribute("aria-selected", "false");
        await test.expect
          .poll(() => usage.evaluate((node) => node.matches(":hover")))
          .toBe(true);
        await visual(
          getCapture(box, colorScheme, {
            item: "ariakit-ui-tabs/focused-hovered-tab",
          }),
        );
      },
    );
  });

  // The panel corners follow scroll-driven animations, which differ between
  // engines, so these tests run in every desktop browser. The visual captures
  // can't show the corners: a corner that squares or rounds changes only a few
  // low-contrast pixels, below the comparison threshold. Each step polls a
  // corner that changes at that scroll, so the other corner reads the same
  // scroll position.

  test("keeps the panel corners round beside a fading strip", async ({ q }) => {
    const title = "Overflowing strip";
    const list = query(q.article(title)).tablist(title);
    // The selected first tab joins the panel, so the start corner is square at
    // rest. Near the end, the end corner stays round under other tabs.
    await test.expect
      .poll(() => getPanelCorners(list))
      .toEqual({ start: 0, end: 12 });
    await scrollStripFromEnd(list, 10);
    await test.expect
      .poll(() => getPanelCorners(list))
      .toEqual({ start: 12, end: 12 });
  });

  // The fade at the end of a strip without buttons grows too slowly to hide a
  // selected last tab that leaves the end, so the panel squares the end corner
  // under the tab, as a strip without fades does, until the fade hides it.
  test("squares the end corner under a selected last tab that leaves the end", async ({
    q,
  }) => {
    const title = "Overflowing strip without buttons";
    const list = query(q.article(title)).tablist(title);
    const tab = query(list).tab("Changelog");
    await scrollStripFromEnd(list, 0);
    await tab.click();
    await test.expect(tab).toHaveAttribute("aria-selected", "true");
    // Each distance from the end changes the end corner from the one before.
    const steps = [
      { distance: 10, square: true },
      { distance: 40, square: false },
      { distance: 10, square: true },
      { distance: 0, square: false },
    ];
    for (const { distance, square } of steps) {
      await scrollStripFromEnd(list, distance);
      const endCorner = test.expect.poll(
        async () => (await getPanelCorners(list)).end,
      );
      // Almost square is less than half of the 12px corner.
      if (square) {
        await endCorner.toBeLessThan(6);
      } else {
        await endCorner.toBe(12);
      }
      test.expect((await getPanelCorners(list)).start).toBe(12);
    }
  });

  test("squares the panel corners beside a strip without fades", async ({
    q,
  }) => {
    const title = "Overflowing strip without fades";
    const list = query(q.article(title)).tablist(title);
    // At rest, the tabs past the end of the strip square the end corner.
    await test.expect
      .poll(() => getPanelCorners(list))
      .toEqual({ start: 12, end: 0 });
    await scrollStripFromStart(list, 120);
    await test.expect
      .poll(() => getPanelCorners(list))
      .toEqual({ start: 0, end: 0 });
  });
});

// Returns the start and end radii of the top corners of the panel below a tab
// strip, in pixels.
function getPanelCorners(list: Locator) {
  return list.evaluate((node) => {
    const panel = node
      .closest(".tabs")
      ?.querySelector(":scope > :has(> [role=tablist]) + *");
    if (!panel) {
      throw new Error("Missing tab panels");
    }
    const style = getComputedStyle(panel);
    return {
      start: Number.parseFloat(style.borderStartStartRadius),
      end: Number.parseFloat(style.borderStartEndRadius),
    };
  });
}

// Scrolls a tab strip to a distance from its start.
function scrollStripFromStart(list: Locator, distance: number) {
  return list.evaluate((node, left) => {
    node.scrollTo({ left, behavior: "instant" });
  }, distance);
}

// Scrolls a tab strip to a distance from its end.
function scrollStripFromEnd(list: Locator, distance: number) {
  return list.evaluate((node, offset) => {
    const end = node.scrollWidth - node.clientWidth;
    node.scrollTo({ left: end - offset, behavior: "instant" });
  }, distance);
}
