import {
  captureInView,
  capturePage,
  expectFocusVisible,
  forEachColorScheme,
  getCapture,
  hoverOver,
  tabTo,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

withCaptures(import.meta.dirname, async ({ query, test }) => {
  // https://github.com/ariakit/ariakit/issues/7474
  test("dims badge and avatar surfaces in disabled controls", async ({
    page,
    q,
  }) => {
    for (const contrast of ["no-preference", "more"] as const) {
      await page.emulateMedia({ contrast });
      await forEachColorScheme(page, async () => {
        const badge = query(q.article("Disabled")).text("3").locator("..");
        const avatars = query(q.article("Disabled avatars"));
        const initial = avatars.text("J");
        const enabledBadge = query(q.article("Count badge"))
          .text("12")
          .locator("..");
        const enabledInitial = query(q.article("Initial avatar")).text("J");
        for (const [slot, enabled] of [
          [badge, enabledBadge],
          [initial, enabledInitial],
        ] as const) {
          // The fill changes before ink is calculated. Compositing the whole
          // slot afterward would reduce the text's adaptive contrast again.
          await test.expect(slot).toHaveCSS("opacity", "1");
          const background = await enabled.evaluate(
            (element) => getComputedStyle(element).backgroundColor,
          );
          await test.expect(slot).not.toHaveCSS("background-color", background);
          await test.expect(enabled).toHaveCSS("opacity", "1");
        }
        const image = avatars.button("Ariakit").locator("img");
        await test.expect(image.locator("..")).toHaveCSS("opacity", "1");
        await test.expect(image).toHaveCSS("opacity", "0.5");
        const enabledImage = query(q.article("Image avatar"))
          .button("Ariakit")
          .locator("img");
        await test.expect(enabledImage).toHaveCSS("opacity", "1");
      });
    }
  });

  for (const attribute of ["disabled", "aria-disabled"]) {
    // https://github.com/ariakit/ariakit/issues/7474
    test(`dims slots when a script changes ${attribute}`, async ({
      page,
      q,
    }) => {
      await forEachColorScheme(page, async () => {
        const badge = query(q.article("Count badge"));
        const initial = query(q.article("Initial avatar"));
        const image = query(q.article("Image avatar"));
        const controls = [
          [badge.button("Inbox 12"), badge.text("12").locator("..")],
          [initial.button("J Jane Doe"), initial.text("J")],
          [
            image.button("Ariakit"),
            image.button("Ariakit").locator("img").locator(".."),
            image.button("Ariakit").locator("img"),
          ],
        ] as const;
        for (const [button, slot, image] of controls) {
          await test.expect(slot).toHaveCSS("opacity", "1");
          const background = await slot.evaluate(
            (element) => getComputedStyle(element).backgroundColor,
          );
          // A script changes the DOM state without rerendering the recipe.
          await button.evaluate(
            (element, name) => element.setAttribute(name, "true"),
            attribute,
          );
          await test.expect(button).toBeDisabled();
          await test.expect(slot).toHaveCSS("opacity", "1");
          if (image) {
            await test.expect(image).toHaveCSS("opacity", "0.5");
          } else {
            await test
              .expect(slot)
              .not.toHaveCSS("background-color", background);
          }
          await button.evaluate(
            (element, name) => element.removeAttribute(name),
            attribute,
          );
          await test.expect(button).toBeEnabled();
          await test.expect(slot).toHaveCSS("opacity", "1");
          await test.expect(slot).toHaveCSS("background-color", background);
          if (image) {
            await test.expect(image).toHaveCSS("opacity", "1");
          }
        }
      });
    });
  }

  for (const attribute of ["disabled", "aria-disabled"]) {
    // https://github.com/ariakit/ariakit/issues/7474
    // https://github.com/ariakit/ariakit/pull/7490#discussion_r3997179911
    test(`dims nested slot ink when a script changes ${attribute}`, async ({
      page,
      q,
    }) => {
      for (const contrast of ["no-preference", "more"] as const) {
        await page.emulateMedia({ contrast });
        await forEachColorScheme(page, async () => {
          const box = query(q.article("Nested badge and avatar"));
          const button = box.button("J Jane Doe 3");
          const slots = [
            [
              box.text("3").locator(".."),
              query(q.article("Disabled")).text("3").locator(".."),
            ],
            [box.text("J"), query(q.article("Disabled avatars")).text("J")],
          ] as const;
          const enabledColors = await Promise.all(
            slots.map(([slot]) =>
              slot.evaluate((element) => getComputedStyle(element).color),
            ),
          );
          await button.evaluate(
            (element, name) => element.setAttribute(name, "true"),
            attribute,
          );
          await test.expect(button).toBeDisabled();
          for (const [slot, disabled] of slots) {
            for (const property of ["background-color", "color"]) {
              const expected = await disabled.evaluate(
                (element, property) =>
                  getComputedStyle(element).getPropertyValue(property),
                property,
              );
              await test.expect(slot).toHaveCSS(property, expected);
            }
          }
          await button.evaluate(
            (element, name) => element.removeAttribute(name),
            attribute,
          );
          await test.expect(button).toBeEnabled();
          for (const [index, [slot]] of slots.entries()) {
            const color = enabledColors[index];
            if (color == null) continue;
            await test.expect(slot).toHaveCSS("color", color);
          }
        });
      }
    });
  }

  // https://github.com/ariakit/ariakit/issues/7474
  test("dims slots in a disabled fieldset except its first legend", async ({
    page,
    q,
  }) => {
    await forEachColorScheme(page, async () => {
      const box = query(q.article("Disabled fieldset"));
      await test.expect(box.button("Actions 1")).toBeEnabled();
      await test.expect(box.text("1").locator("..")).toHaveCSS("opacity", "1");
      await test.expect(box.button("J Jane Doe 3")).toBeDisabled();
      const enabled = await box
        .text("1")
        .locator("..")
        .evaluate((element) => getComputedStyle(element).backgroundColor);
      for (const slot of [box.text("3").locator(".."), box.text("J")]) {
        await test.expect(slot).toHaveCSS("opacity", "1");
        await test.expect(slot).not.toHaveCSS("background-color", enabled);
      }
    });
  });

  // https://github.com/ariakit/ariakit/issues/7474
  test("gives the disabled style prop the native disabled contrast", async ({
    page,
    q,
  }) => {
    for (const contrast of ["no-preference", "more"] as const) {
      await page.emulateMedia({ contrast });
      await forEachColorScheme(page, async () => {
        const native = query(q.article("Disabled")).button("Delete 3");
        const label = query(q.article("Disabled upload label")).text(
          "Upload attachment",
        );
        await test.expect(label).not.toHaveAttribute("disabled");
        await test.expect(label).not.toHaveAttribute("aria-disabled");
        const color = await native.evaluate(
          (element) => getComputedStyle(element).color,
        );
        await test.expect(label).toHaveCSS("color", color);
      });
    }
  });

  // The page capture also keeps the static states of the button group fixture
  // under visual regression: joined borders, kept corners and the selected
  // glider.
  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3972227948
  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3974550181
  // https://github.com/ariakit/ariakit/issues/7466
  test("page @visual", async ({ page, visual }) => {
    await forEachColorScheme(page, (colorScheme) =>
      capturePage(page, visual, colorScheme),
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
      await captureInView(visual, box, colorScheme);
    });
  });

  test("moves the segmented control glider to the clicked radio @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorScheme(page, async (colorScheme) => {
      const box = q.article("Segmented control");
      const grid = query(query(box).radiogroup("View")).radio("Grid");
      await grid.click();
      await test.expect(grid).toBeChecked();
      await captureInView(visual, box, colorScheme);
    });
  });

  test("moves the hover glider over a hovered link @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorScheme(page, async (colorScheme) => {
      const box = q.article("Current link gliders");
      const activity = query(box).link("Activity");
      // A synthesized pointer move that scrolls the group into view does not
      // apply :hover in WebKit until the pointer enters another element, so the
      // pointer passes over Settings on its way to Activity.
      await activity.scrollIntoViewIfNeeded();
      await query(box).link("Settings").hover();
      await hoverOver(activity);
      await visual(getCapture(box, colorScheme));
    });
  });

  // A hovered control owns both of its shared edges, so each one takes the
  // hovered surface instead of darkening where two borders overlap.
  // https://github.com/ariakit/ariakit/issues/7466
  for (const title of ["Horizontal", "Joined vertical"]) {
    test(`tints both shared edges of the hovered middle control in ${title} @visual`, async ({
      page,
      q,
      visual,
    }) => {
      await forEachColorScheme(page, async (colorScheme) => {
        const group = q.group(title);
        await hoverOver(query(group).button("Week"));
        await visual(getCapture(group, colorScheme));
      });
    });
  }
});
