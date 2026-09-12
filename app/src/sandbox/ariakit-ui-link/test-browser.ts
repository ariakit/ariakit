import {
  captureInView,
  capturePage,
  expectFocusVisible,
  forEachColorScheme,
  tabTo,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

withCaptures(import.meta.dirname, async ({ query, test }) => {
  test("page @visual", async ({ page, visual }) => {
    await forEachColorScheme(page, (colorScheme) =>
      capturePage(page, visual, colorScheme),
    );
  });

  // https://github.com/ariakit/ariakit/issues/7483
  test("keeps the focus ring against an inline link @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorScheme(page, async (colorScheme) => {
      const box = q.article("Default");
      const link = query(box).link("styling guide");
      await tabTo(page, link);
      await expectFocusVisible(link);
      await captureInView(visual, box, colorScheme);
    });
  });

  test("offsets the focus ring of a standalone link @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorScheme(page, async (colorScheme) => {
      const box = q.article("Offset focus ring");
      const link = query(box).link("View all");
      await tabTo(page, link);
      await expectFocusVisible(link);
      await captureInView(visual, box, colorScheme);
    });
  });
});
