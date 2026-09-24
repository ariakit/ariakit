import {
  captureInView,
  expectFocusVisible,
  expectMedia,
  forEachColorScheme,
  hoverOver,
  tabTo,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

withCaptures(import.meta.dirname, async ({ query, test }) => {
  // https://github.com/ariakit/ariakit/pull/7500#discussion_r4000661269
  test("keeps a filled control boundary in forced colors @visual", async ({
    page,
    q,
    visual,
  }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await forEachColorScheme(page, async (colorScheme) => {
      await captureInView({
        visual,
        box: q.article("Control surfaces"),
        colorScheme,
        item: "ariakit-ui-button/forced-colors/control-surfaces",
      });
    });
  });

  // https://github.com/ariakit/ariakit/pull/7500#discussion_r4000661269
  test("keeps glider boundaries and inherited widths in forced colors @visual", async ({
    page,
    q,
    visual,
  }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await forEachColorScheme(page, async (colorScheme) => {
      await captureInView({
        visual,
        box: q.article("Glider"),
        colorScheme,
        item: "ariakit-ui-button/forced-colors/glider",
        id: "joined",
      });
      const links = q.article("Current link gliders");
      await hoverOver(query(links).link("Activity"));
      await test
        .expect(links.locator(".glider:not(.selected):not(.focus)"))
        .toBeVisible();
      await captureInView({
        visual,
        box: links,
        colorScheme,
        item: "ariakit-ui-button/forced-colors/glider-hover",
        id: "hover",
      });
    });
  });

  // https://github.com/ariakit/ariakit/issues/7476
  // https://github.com/ariakit/ariakit/pull/7500#discussion_r3995296714
  test("keeps disabled layers borderless and preserves bevels in forced colors @visual", async ({
    page,
    q,
    visual,
  }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await forEachColorScheme(page, async (colorScheme) => {
      await expectMedia(page, "(forced-colors: active)");
      await captureInView({
        visual,
        box: q.article("Layer disabled"),
        colorScheme,
        item: "ariakit-ui-button/forced-colors/disabled-layer",
      });
    });
  });

  // https://github.com/ariakit/ariakit/issues/7476
  test("keeps filled and bevel button boundaries in forced colors @visual", async ({
    page,
    q,
    visual,
  }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await forEachColorScheme(page, async (colorScheme) => {
      await expectMedia(page, "(forced-colors: active)");
      for (const [key, title] of [
        ["default", "Default"],
        ["lifted", "Lifted"],
        ["pushed", "Pushed"],
        ["contrast", "Contrast"],
        ["desaturated", "Desaturated"],
        ["brand", "Brand"],
        ["bevel", "Bevel"],
        ["inverted", "Inverted"],
      ] as const) {
        await captureInView({
          visual,
          box: q.article(title),
          colorScheme,
          item: `ariakit-ui-button/forced-colors/${key}`,
          id: title,
        });
      }
      const box = q.article("Thick focus ring");
      const button = query(box).button("Move");
      await tabTo(page, button);
      await expectFocusVisible(button);
      await captureInView({
        visual,
        box,
        colorScheme,
        item: "ariakit-ui-button/forced-colors/focus-ring",
        id: "focus",
      });
    });
  });

  // https://github.com/ariakit/ariakit/issues/7476
  // https://github.com/ariakit/ariakit/pull/7500#discussion_r3996535606
  test("preserves explicit ring and inset button edges in forced colors @visual", async ({
    page,
    q,
    visual,
  }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await forEachColorScheme(page, async (colorScheme) => {
      await captureInView({
        visual,
        box: q.article("Ring borders"),
        colorScheme,
        item: "ariakit-ui-button/forced-colors/ring-borders",
      });
    });
  });
});
