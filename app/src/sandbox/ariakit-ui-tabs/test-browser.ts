import {
  captureInView,
  capturePage,
  expectFocusVisible,
  expectMedia,
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

  // A bar outside its tab inverts from the surface behind the tab. It used to
  // invert from the tab, which a pushed tab turns light in high contrast, so
  // the bar painted dark on the dark surface behind it.
  test("page in high contrast @visual", async ({ page, visual }) => {
    await page.emulateMedia({ contrast: "more" });
    await forEachColorScheme(page, async (colorScheme) => {
      await expectMedia(page, "(prefers-contrast: more)");
      await capturePage({
        page,
        visual,
        colorScheme,
        item: "ariakit-ui-tabs/page",
      });
    });
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
});
