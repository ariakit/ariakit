import {
  captureInView,
  capturePage,
  expectFocusVisible,
  expectMedia,
  forEachColorScheme,
  forEachColorSchemeOf,
  getCapture,
  hoverOver,
  tabTo,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

withCaptures(import.meta.dirname, async ({ query, test }) => {
  // The page capture also keeps the custom navigation label styles of the nav
  // fixtures under visual regression.
  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3972223730
  test("page @visual", async ({ page, visual }) => {
    await forEachColorScheme(page, (colorScheme) =>
      capturePage({ page, visual, colorScheme, item: "ariakit-ui-nav/page" }),
    );
  });

  // Current-link bars outside their rows invert from the surface around the
  // rows, which high contrast paints at the opposite extreme from the rows.
  test("page in high contrast @visual", async ({ page, visual }) => {
    await page.emulateMedia({ contrast: "more" });
    await forEachColorScheme(page, async (colorScheme) => {
      await expectMedia(page, "(prefers-contrast: more)");
      await capturePage({
        page,
        visual,
        colorScheme,
        item: "ariakit-ui-nav/page",
      });
    });
  });

  // The nested section's root must not paint a surface of its own over the
  // current and hovered rows.
  test("shows the current surface and a hovered row of a nested section @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorSchemeOf(
      page,
      ["Nested disclosures"],
      async (colorScheme) => {
        const box = q.article("Nested disclosures");
        await hoverOver(query(box).link("Radio"));
        await visual(
          getCapture(box, colorScheme, {
            item: "ariakit-ui-nav/nested-section-hover",
          }),
        );
      },
    );
  });

  test("moves the sidebar current surface on click and shows keyboard focus on a row @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorSchemeOf(page, ["Sidebar"], async (colorScheme) => {
      const box = q.article("Sidebar");
      const quickstart = query(box).link("Quickstart").first();
      await quickstart.click();
      await test.expect(quickstart).toHaveAttribute("aria-current", "page");
      const introduction = query(box).link("Introduction").nth(1);
      await tabTo(page, introduction);
      await expectFocusVisible(introduction);
      await test.expect(introduction).toHaveCSS("outline-style", "solid");
      await captureInView({
        visual,
        box,
        colorScheme,
        item: "ariakit-ui-nav/sidebar-current-focus",
      });
    });
  });
});
