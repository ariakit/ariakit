import {
  captureInView,
  capturePage,
  expectFocusVisible,
  forEachColorScheme,
  getBadgeHeight,
  getCapsOffset,
  tabTo,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

withCaptures(import.meta.dirname, async ({ query, test }) => {
  // A tile's top row is as tall as its largest slot. A badge beside that slot
  // keeps the height it has in the tile's content, with its text centered.
  // https://github.com/ariakit/ariakit/issues/7599
  test("keeps a badge in a tile's top row at its own height", async ({ q }) => {
    const plans = query(q.group("Plans"));
    const popular = plans.text("Popular");
    const recommended = plans.text("Recommended");
    await test.expect(popular).toBeVisible();
    test
      .expect(await getBadgeHeight(popular))
      .toBe(await getBadgeHeight(recommended));
    test.expect(await getCapsOffset(popular)).toBeCloseTo(0, 1);
  });

  test("page @visual", async ({ page, visual }) => {
    await forEachColorScheme(page, (colorScheme) =>
      capturePage({
        page,
        visual,
        colorScheme,
        item: "ariakit-ui-checkbox/page",
      }),
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
      await captureInView({
        visual,
        box,
        colorScheme,
        item: "ariakit-ui-checkbox/focused-field-ring",
      });
    });
  });
});
