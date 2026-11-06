import {
  captureInView,
  expectFocusVisible,
  expectMedia,
  forEachColorScheme,
  forEachColorSchemeOf,
  hoverOver,
  tabTo,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

withCaptures(import.meta.dirname, async ({ query, test }) => {
  test("hides a separator beside a hovered button when the gap is small", async ({
    q,
  }) => {
    const example = query(q.article("Pipe separators"));
    const undo = example.button("Undo");
    const mark = undo.locator("+ *");
    await test.expect(mark).toHaveCSS("opacity", "1");
    await hoverOver(undo);
    await test.expect(mark).toHaveCSS("opacity", "0");
  });

  test("hides a rule from the separator prop beside a hovered button", async ({
    q,
  }) => {
    const example = query(q.article("Separators from the separator prop"));
    const copy = example.button("Copy");
    const mark = copy.locator("xpath=preceding-sibling::*[1]");
    await test.expect(mark).toHaveAttribute("aria-hidden", "true");
    await test.expect(mark).toHaveCSS("opacity", "1");
    await hoverOver(copy);
    await test.expect(mark).toHaveCSS("opacity", "0");
  });

  test("keeps the separators beside a hovered button in a wide gap", async ({
    page,
    q,
  }) => {
    const example = query(q.article("Separators in a wide gap"));
    const redo = example.button("Redo");
    const pipe = redo.locator("xpath=preceding-sibling::*[1]");
    const slash = redo.locator("+ *");
    await hoverOver(redo);
    // A hiding mark would start its 200ms transition here. No state tracks a
    // mark that stays, so wait past the transition before the assertions.
    await page.waitForTimeout(300);
    await test.expect(pipe).toHaveCSS("opacity", "1");
    await test.expect(slash).toHaveCSS("opacity", "1");
    const transparent = "rgba(0, 0, 0, 0)";
    await test.expect(pipe).not.toHaveCSS("border-right-color", transparent);
    await test.expect(slash).not.toHaveCSS("border-right-color", transparent);
  });

  // https://github.com/ariakit/ariakit/pull/7500#discussion_r4000661269
  test("keeps a filled control boundary in forced colors @visual", async ({
    page,
    q,
    visual,
  }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await forEachColorSchemeOf(
      page,
      ["Control surfaces"],
      async (colorScheme) => {
        await captureInView({
          visual,
          box: q.article("Control surfaces"),
          colorScheme,
          item: "ariakit-ui-button/forced-colors/control-surfaces",
        });
      },
    );
  });

  test("keeps the boundary of badges in box slots in forced colors @visual", async ({
    page,
    q,
    visual,
  }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await forEachColorSchemeOf(
      page,
      ["Badges in box slots", "Disabled badges in box slots"],
      async (colorScheme) => {
        await captureInView({
          visual,
          box: q.article("Badges in box slots"),
          colorScheme,
          item: "ariakit-ui-button/forced-colors/badges-in-box-slots",
        });
        await captureInView({
          visual,
          box: q.article("Disabled badges in box slots"),
          colorScheme,
          item: "ariakit-ui-button/forced-colors/disabled-badges-in-box-slots",
        });
      },
    );
  });

  // https://github.com/ariakit/ariakit/pull/7500#discussion_r4000661269
  test("keeps joined selection boundaries and inherited widths in forced colors @visual", async ({
    page,
    q,
    visual,
  }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await forEachColorSchemeOf(
      page,
      ["Joined selection"],
      async (colorScheme) => {
        await captureInView({
          visual,
          box: q.article("Joined selection"),
          colorScheme,
          item: "ariakit-ui-button/forced-colors/joined-selection",
        });
      },
    );
  });

  // https://github.com/ariakit/ariakit/issues/7476
  // https://github.com/ariakit/ariakit/pull/7500#discussion_r3995296714
  test("keeps disabled layers borderless and preserves bevels in forced colors @visual", async ({
    page,
    q,
    visual,
  }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await forEachColorSchemeOf(
      page,
      ["Layer disabled"],
      async (colorScheme) => {
        await expectMedia(page, "(forced-colors: active)");
        await captureInView({
          visual,
          box: q.article("Layer disabled"),
          colorScheme,
          item: "ariakit-ui-button/forced-colors/disabled-layer",
        });
      },
    );
  });

  // The cards disable their buttons through the native attribute, the recipe
  // class alone, a fieldset, and aria-disabled.
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
        ["disabled", "Disabled"],
        ["disabled-upload-label", "Disabled upload label"],
        ["disabled-avatars", "Disabled avatars"],
        ["disabled-fieldset", "Disabled fieldset"],
        ["focusable-disabled", "Focusable disabled"],
      ] as const) {
        await captureInView({
          visual,
          box: q.article(title),
          colorScheme,
          item: `ariakit-ui-button/forced-colors/${key}`,
        });
      }
    });
  });

  // https://github.com/ariakit/ariakit/issues/7476
  // https://github.com/ariakit/ariakit/issues/7591
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
        ["count-badge", "Count badge"],
        ["initial-avatar", "Initial avatar"],
      ] as const) {
        await captureInView({
          visual,
          box: q.article(title),
          colorScheme,
          item: `ariakit-ui-button/forced-colors/${key}`,
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
    await forEachColorSchemeOf(page, ["Ring borders"], async (colorScheme) => {
      await captureInView({
        visual,
        box: q.article("Ring borders"),
        colorScheme,
        item: "ariakit-ui-button/forced-colors/ring-borders",
      });
    });
  });
});
