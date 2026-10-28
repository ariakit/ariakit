import {
  captureInView,
  capturePage,
  expectFocusVisible,
  forEachColorScheme,
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
      await forEachColorScheme(page, async (colorScheme) => {
        const distance = q.combobox("Tab bar distance");
        await distance.selectOption("-3px");
        await test.expect(distance).toHaveValue("-3px");
        await captureInView({
          visual,
          box: q.article("Bar placement"),
          colorScheme,
          item: "ariakit-ui-tabs/bar-over-tab",
        });
      });
    }
  });

  test("paints the hover pill on a hovered tab @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorScheme(page, async (colorScheme) => {
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
    await forEachColorScheme(page, async (colorScheme) => {
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

  // Focus kept the selected offset of flat and bevel tabs, so the brand fill
  // fell under 3:1 against a dark strip, also while hovered. Without the
  // offset, a selected push alone lightens the fill under 3:1 in light mode.
  // https://github.com/ariakit/ariakit/issues/8101
  test("removes the selected lift from a focused tab @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorScheme(page, async (colorScheme) => {
      const placement = q.article("Bar placement");
      const pushed = query(placement).tab("Preview");
      // Firefox makes this overflowing strip a tab stop, and focusing it clears
      // the active tab, so the Tab back from it would skip the tabs. Arrow keys
      // reach the tab with the keyboard.
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
    });
  });

  // The hover offset darkened the brand fill of a focused unselected flat tab
  // under 3:1 against a dark strip.
  // https://github.com/ariakit/ariakit/issues/8111
  test("keeps the focus fill of a hovered unselected tab @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorScheme(page, async (colorScheme) => {
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
    });
  });
});
