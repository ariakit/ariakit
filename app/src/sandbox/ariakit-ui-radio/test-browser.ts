import {
  captureSections,
  forEachColorScheme,
  getCapture,
  hoverOver,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

withCaptures(import.meta.dirname, async ({ query, test }) => {
  test("sections @visual", async ({ page, visual }) => {
    await forEachColorScheme(page, (colorScheme) =>
      captureSections(page, visual, colorScheme),
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
      await hoverOver(
        query(box)
          .radio(/^Hobby/)
          .locator("xpath=.."),
      );
      await visual(getCapture(box, colorScheme));
    });
  });

  test("keeps a card of a disabled grid unlit on hover @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorScheme(page, async (colorScheme) => {
      const box = q.article("Disabled card grid");
      await hoverOver(
        query(box)
          .radio(/^Hobby/)
          .locator("xpath=.."),
      );
      await visual(getCapture(box, colorScheme));
    });
  });
});
