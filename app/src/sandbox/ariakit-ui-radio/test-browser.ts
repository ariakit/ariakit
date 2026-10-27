import {
  capturePage,
  forEachColorScheme,
  getCapture,
  hoverOver,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

withCaptures(import.meta.dirname, async ({ query, test }) => {
  test("page @visual", async ({ page, visual }) => {
    await forEachColorScheme(page, (colorScheme) =>
      capturePage({ page, visual, colorScheme, item: "ariakit-ui-radio/page" }),
    );
  });

  test("lights an enabled card on hover @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorScheme(page, async (colorScheme) => {
      const box = q.article("Cards");
      // The card is the label around the hidden input.
      await hoverOver(query(box).radio("Hobby").locator("xpath=.."));
      await visual(
        getCapture(box, colorScheme, {
          item: "ariakit-ui-radio/enabled-card-hover",
        }),
      );
    });
  });

  // A click can't change a checked radio, so hovering it, its row, or its card
  // doesn't light it.
  test("keeps a checked radio unlit on hover @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorScheme(page, async (colorScheme) => {
      const box = q.article("Group");
      await hoverOver(query(box).text("Pro"));
      await visual(
        getCapture(box, colorScheme, {
          item: "ariakit-ui-radio/checked-field-hover",
        }),
      );
    });
  });

  // Outside a field row, the input's own hover rule lights it.
  test("keeps a checked inline radio unlit on hover @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorScheme(page, async (colorScheme) => {
      const box = q.article("Inline radios");
      await hoverOver(query(box).radio("Office"));
      await visual(
        getCapture(box, colorScheme, {
          item: "ariakit-ui-radio/checked-inline-hover",
        }),
      );
    });
  });

  test("keeps a checked card unlit on hover @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorScheme(page, async (colorScheme) => {
      const box = q.article("Cards");
      await hoverOver(query(box).radio("Pro").locator("xpath=.."));
      await visual(
        getCapture(box, colorScheme, {
          item: "ariakit-ui-radio/checked-card-hover",
        }),
      );
    });
  });

  test("keeps a card of a disabled grid unlit on hover @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorScheme(page, async (colorScheme) => {
      const box = q.article("Disabled card grid");
      await hoverOver(query(box).radio("Hobby").locator("xpath=.."));
      await visual(
        getCapture(box, colorScheme, {
          item: "ariakit-ui-radio/disabled-card-hover",
        }),
      );
    });
  });
});
