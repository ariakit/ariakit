import {
  captureInView,
  expectMedia,
  forEachColorScheme,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

withCaptures(import.meta.dirname, async ({ test }) => {
  // Forced colors replace the card's fill with the system canvas and remove
  // shadows. The dot and the check take the system text color, and a card
  // without a mark draws a border one pixel wider than its own.
  test("shows the checked state of cards in forced colors @visual", async ({
    page,
    q,
    visual,
  }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await forEachColorScheme(page, async (colorScheme) => {
      await expectMedia(page, "(forced-colors: active)");
      for (const [key, title] of [
        ["cards", "Cards"],
        ["floating-check", "Floating check"],
        ["cards-without-a-mark", "Cards without a mark"],
        ["thick-cards-without-a-mark", "Thick cards without a mark"],
      ] as const) {
        await captureInView({
          visual,
          box: q.article(title),
          colorScheme,
          item: `ariakit-ui-radio/forced-colors/${key}`,
        });
      }
    });
  });
});
