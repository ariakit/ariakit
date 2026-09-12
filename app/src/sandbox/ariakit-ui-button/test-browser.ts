import {
  captureInView,
  capturePage,
  expectFocusVisible,
  expectMedia,
  forEachColorScheme,
  getCapture,
  hoverOver,
  tabTo,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

withCaptures(import.meta.dirname, async ({ query, test }) => {
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

  // https://github.com/ariakit/ariakit/issues/7476
  test("keeps filled and bevel button boundaries in forced colors @visual", async ({
    page,
    q,
    visual,
  }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await forEachColorScheme(page, async (colorScheme) => {
      await expectMedia(page, "(forced-colors: active)");
      for (const [title, name] of [
        ["Default", "Cancel"],
        ["Lifted", "Edit"],
        ["Pushed", "Publish changes"],
        ["Contrast", "Review changes"],
        ["Desaturated", "Preview changes"],
        ["Brand", "Save changes"],
        ["Bevel", "Duplicate"],
        ["Inverted", "Continue"],
      ] as const) {
        const box = q.article(title);
        const button = query(box).button(name);
        await test
          .expect(button)
          .toHaveCSS("border-top-width", title === "Default" ? "0px" : "1px");
        if (title === "Pushed") {
          await test
            .expect(query(box).button("Cancel changes"))
            .toHaveCSS("border-top-width", "0px");
        }
        await captureInView(visual, box, colorScheme, {
          id: title,
        });
      }
      const box = q.article("Thick focus ring");
      const button = query(box).button("Move");
      await tabTo(page, button);
      await expectFocusVisible(button);
      await captureInView(visual, box, colorScheme, { id: "focus" });
    });
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
