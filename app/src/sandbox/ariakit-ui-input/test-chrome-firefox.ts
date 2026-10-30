import {
  captureInView,
  expectMedia,
  forEachColorScheme,
  forEachColorSchemeOf,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

withCaptures(import.meta.dirname, async ({ query, test }) => {
  // https://github.com/ariakit/ariakit/issues/7871
  test("uses the system disabled color in forced colors @visual", async ({
    page,
    q,
    visual,
  }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await forEachColorSchemeOf(page, ["Disabled"], async (colorScheme) => {
      await expectMedia(page, "(forced-colors: active)");
      await captureInView({
        visual,
        box: q.article("Disabled"),
        colorScheme,
        item: "ariakit-ui-input/forced-colors/disabled",
      });
    });
  });

  // The wrapper and its icon read the disabled state from the input, which
  // application code can set after render.
  // https://github.com/ariakit/ariakit/issues/7871
  test("uses the system disabled color on the wrapper of a disabled input in forced colors @visual", async ({
    page,
    q,
    visual,
  }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await forEachColorSchemeOf(
      page,
      ["Field with leading icon"],
      async (colorScheme) => {
        await expectMedia(page, "(forced-colors: active)");
        const box = q.article("Field with leading icon");
        const input = query(box).textbox("Filter components");
        await input.evaluate((node) => node.setAttribute("disabled", ""));
        await test.expect(input).toBeDisabled();
        await captureInView({
          visual,
          box,
          colorScheme,
          item: "ariakit-ui-input/forced-colors/disabled-wrapper",
        });
      },
    );
  });

  // An enabled action button in a disabled field can still be used, so it must
  // not take the system disabled color of the field. The Copy button sets its
  // own color; the native Clear button inherits its color.
  // https://github.com/ariakit/ariakit/pull/7874#discussion_r4257613255
  test("keeps an enabled button in a disabled field in its own color in forced colors @visual", async ({
    page,
    q,
    visual,
  }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await forEachColorScheme(page, async (colorScheme) => {
      await expectMedia(page, "(forced-colors: active)");
      for (const { key, title, field, button } of [
        {
          key: "disabled-wrapper-enabled-button",
          title: "Share link with copy button",
          field: "Share link",
          button: "Copy",
        },
        {
          key: "disabled-wrapper-enabled-native-button",
          title: "Field with leading reset button",
          field: "Draft message",
          button: "Clear",
        },
      ]) {
        const box = q.article(title);
        const input = query(box).textbox(field);
        await input.evaluate((node) => node.setAttribute("disabled", ""));
        await test.expect(input).toBeDisabled();
        await test.expect(query(box).button(button)).toBeEnabled();
        await captureInView({
          visual,
          box,
          colorScheme,
          item: `ariakit-ui-input/forced-colors/${key}`,
        });
      }
    });
  });

  // Chromium paints an inline SVG in the system text color by itself. The icon
  // part sets the system color for engines that do not force SVG colors. The
  // panel loses its fill, so it keeps a system border.
  // https://github.com/ariakit/ariakit/issues/8053
  test("paints the error icon in the system text color in forced colors @visual", async ({
    page,
    q,
    visual,
  }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await forEachColorScheme(page, async (colorScheme) => {
      await expectMedia(page, "(forced-colors: active)");
      for (const [key, title] of [
        ["error-long-message", "Error with a long message"],
        ["error-another-icon", "Error with another icon"],
        ["error-panel", "Error on a panel"],
      ] as const) {
        await captureInView({
          visual,
          box: q.article(title),
          colorScheme,
          item: `ariakit-ui-input/forced-colors/${key}`,
        });
      }
    });
  });
});
