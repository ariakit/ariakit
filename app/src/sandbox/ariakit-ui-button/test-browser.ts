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
    await forEachColorScheme(page, async () => {
      const badge = query(q.article("Disabled")).text("3").locator("..");
      const avatars = query(q.article("Disabled avatars"));
      const initial = avatars.text("J");
      const image = avatars.button("Ariakit").locator("img").locator("..");
      for (const slot of [badge, initial, image]) {
        await test.expect(slot).toBeVisible();
        const opacity = await slot.evaluate(
          (element) => getComputedStyle(element).opacity,
        );
        test.expect(Number(opacity)).toBeGreaterThan(0);
        test.expect(Number(opacity)).toBeLessThan(1);
      }
      const enabled = query(q.article("Count badge")).text("12").locator("..");
      await test.expect(enabled).toHaveCSS("opacity", "1");
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
