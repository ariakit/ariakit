import {
  captureInView,
  capturePage,
  expectFocusVisible,
  forEachColorScheme,
  tabTo,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

withCaptures(import.meta.dirname, async ({ query, test }) => {
  // https://github.com/ariakit/ariakit/issues/7474
  // https://github.com/ariakit/ariakit/pull/7490#discussion_r3997200806
  test("uses compact text for a card badge", async ({ q }) => {
    const badge = query(q.article("Card badge")).text("3");
    await test.expect(badge).toHaveCSS("font-size", "13px");
  });

  test("page @visual", async ({ page, visual }) => {
    await forEachColorScheme(page, (colorScheme) =>
      capturePage(page, visual, colorScheme),
    );
  });

  test("draws the ring of a focused field on its box @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorScheme(page, async (colorScheme) => {
      const box = q.article("Checkbox field");
      const input = query(box).checkbox("Remember me");
      await tabTo(page, input);
      await expectFocusVisible(input);
      await captureInView(visual, box, colorScheme);
    });
  });
});
