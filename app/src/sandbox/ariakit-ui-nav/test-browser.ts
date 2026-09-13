import {
  captureInView,
  captureSections,
  expectFocusVisible,
  forEachColorScheme,
  getCapture,
  hoverOver,
  tabTo,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

withCaptures(import.meta.dirname, async ({ query, test }) => {
  // The section captures also keep the custom navigation label styles of the
  // nav fixtures under visual regression.
  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3972223730
  test("sections @visual", async ({ page, visual }) => {
    await forEachColorScheme(page, (colorScheme) =>
      captureSections(page, visual, colorScheme),
    );
  });

  // The nested section's root sits in a content that stacks over the gliders,
  // so it must not paint a surface of its own over them.
  test("shows the hover cover on a row of a nested section @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorScheme(page, async (colorScheme) => {
      const box = q.article("Nested disclosures");
      await hoverOver(query(box).link("Radio"));
      await visual(getCapture(box, colorScheme));
    });
  });

  test("moves the sidebar current cover on click and the focus ring with the keyboard @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorScheme(page, async (colorScheme) => {
      const box = q.article("Sidebar");
      const quickstart = query(box).link("Quickstart").first();
      await quickstart.click();
      await test.expect(quickstart).toHaveAttribute("aria-current", "page");
      const introduction = query(box).link("Introduction").nth(1);
      await tabTo(page, introduction);
      await expectFocusVisible(introduction);
      await captureInView(visual, box, colorScheme);
    });
  });
});
