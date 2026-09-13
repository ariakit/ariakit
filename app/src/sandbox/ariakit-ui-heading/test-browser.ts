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

  test("underlines a permalink on hover @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorScheme(page, async (colorScheme) => {
      const box = q.article("Permalink");
      await hoverOver(query(box).link("Anchored heading"));
      await visual(getCapture(box, colorScheme));
    });
  });
});
