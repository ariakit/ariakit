import {
  captureInView,
  expectMedia,
  forEachColorScheme,
  forEachColorSchemeOf,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

withCaptures(import.meta.dirname, async ({ test }) => {
  // The cards disable their fields and cards through the native attribute and
  // through aria-disabled.
  // https://github.com/ariakit/ariakit/issues/7871
  test("uses the system disabled color in forced colors @visual", async ({
    page,
    q,
    visual,
  }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await forEachColorScheme(page, async (colorScheme) => {
      await expectMedia(page, "(forced-colors: active)");
      for (const [key, title] of [
        ["disabled-field-labels", "Disabled field labels"],
        ["disabled-card-badges", "Disabled card badges"],
        ["disabled-checked-card", "Disabled checked card"],
      ] as const) {
        await captureInView({
          visual,
          box: q.article(title),
          colorScheme,
          item: `ariakit-ui-checkbox/forced-colors/${key}`,
        });
      }
    });
  });

  // Forced colors replace the card's fill with the system canvas and remove
  // shadows. The check takes the system text color, and a card without a mark
  // draws a thicker border.
  test("shows the checked state of cards in forced colors @visual", async ({
    page,
    q,
    visual,
  }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await forEachColorScheme(page, async (colorScheme) => {
      await expectMedia(page, "(forced-colors: active)");
      for (const [key, title] of [
        ["floating-check", "Floating check"],
        ["cards-without-a-mark", "Cards without a mark"],
      ] as const) {
        await captureInView({
          visual,
          box: q.article(title),
          colorScheme,
          item: `ariakit-ui-checkbox/forced-colors/${key}`,
        });
      }
    });
  });

  // Forced colors remove the fill of a switch, so a system checkbox could
  // replace it. The switch keeps its own track, and the thumb's position shows
  // the state.
  test("draws the switch mark in forced colors @visual", async ({
    page,
    q,
    visual,
  }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await forEachColorSchemeOf(
      page,
      ["Switch mark", "Switch cards"],
      async (colorScheme) => {
        await expectMedia(page, "(forced-colors: active)");
        for (const [key, title] of [
          ["switch-mark", "Switch mark"],
          ["switch-cards", "Switch cards"],
        ] as const) {
          await captureInView({
            visual,
            box: q.article(title),
            colorScheme,
            item: `ariakit-ui-checkbox/forced-colors/${key}`,
          });
        }
      },
    );
  });

  // An adaptive text color targets nested text directly, so the disabled fields
  // and the disabled card need the system color on the same targets.
  // https://github.com/ariakit/ariakit/issues/7869
  test("uses the system disabled color in colored text in forced colors @visual", async ({
    page,
    q,
    visual,
  }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await forEachColorSchemeOf(
      page,
      ["Disabled choices in colored text"],
      async (colorScheme) => {
        await expectMedia(page, "(forced-colors: active)");
        await captureInView({
          visual,
          box: q.article("Disabled choices in colored text"),
          colorScheme,
          item: "ariakit-ui-checkbox/forced-colors/disabled-colored-text",
        });
      },
    );
  });
});
