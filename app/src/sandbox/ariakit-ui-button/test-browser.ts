import {
  captureInView,
  capturePage,
  expectFocusVisible,
  forEachColorScheme,
  getCapsOffset,
  getCapture,
  hoverOver,
  tabTo,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

withCaptures(import.meta.dirname, async ({ query, test }) => {
  // Each engine rounds the half-leading of a line box its own way, so the badge
  // text centers only once its box is trimmed to the capitals.
  // https://github.com/ariakit/ariakit/issues/7588
  test("centers the badge text in its slot", async ({ q }) => {
    const text = query(q.article("Count badge")).text("12");
    await test.expect(text).toBeVisible();
    test.expect(await getCapsOffset(text)).toBeCloseTo(0, 1);
  });

  // The page capture also keeps the static states of the button group fixture
  // under visual regression: joined borders, kept corners and the selected
  // surface.
  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3972227948
  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3974550181
  // https://github.com/ariakit/ariakit/issues/7466
  test("page @visual", async ({ page, visual }) => {
    await forEachColorScheme(page, (colorScheme) =>
      capturePage({
        page,
        visual,
        colorScheme,
        item: "ariakit-ui-button/page",
      }),
    );
  });

  test("shows the thick focus ring on keyboard focus @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorScheme(page, async (colorScheme) => {
      const box = q.article("Thick focus ring");
      const button = query(box).button("Move");
      await tabTo(page, button);
      await expectFocusVisible(button);
      await captureInView({
        visual,
        box,
        colorScheme,
        item: "ariakit-ui-button/thick-focus-ring",
      });
    });
  });

  test("moves the segmented control selection to the clicked radio @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorScheme(page, async (colorScheme) => {
      const box = q.article("Segmented control");
      const grid = query(query(box).radiogroup("View")).radio("Grid");
      await grid.click();
      await test.expect(grid).toBeChecked();
      await captureInView({
        visual,
        box,
        colorScheme,
        item: "ariakit-ui-button/segmented-control-click",
      });
    });
  });

  // A hovered control owns both of its shared edges, so each one takes the
  // hovered surface instead of darkening where two borders overlap.
  // https://github.com/ariakit/ariakit/issues/7466
  for (const [key, title] of [
    ["horizontal", "Horizontal"],
    ["joined-vertical", "Joined vertical"],
  ] as const) {
    test(`tints both shared edges of the hovered middle control in ${title} @visual`, async ({
      page,
      q,
      visual,
    }) => {
      await forEachColorScheme(page, async (colorScheme) => {
        const group = q.group(title);
        await hoverOver(query(group).button("Week"));
        await visual(
          getCapture(group, colorScheme, {
            item: `ariakit-ui-button/shared-edge-hover/${key}`,
          }),
        );
      });
    });
  }
});
