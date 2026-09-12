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
  // https://github.com/ariakit/ariakit/issues/7475
  test("fits two wide initials inside an avatar slot", async ({ q }) => {
    const initials = query(q.article("Initial avatar")).text("WW");
    await test.expect(initials).toBeVisible();
    await test.expect
      .poll(() =>
        initials.evaluate((element) => {
          const slot = element.closest(".overflow-clip");
          if (!slot) throw new Error("Avatar slot not found");
          const range = document.createRange();
          range.selectNodeContents(element);
          const text = range.getBoundingClientRect();
          const bounds = slot.getBoundingClientRect();
          return (
            Math.abs(bounds.width - bounds.height) < 1 &&
            text.left >= bounds.left &&
            text.right <= bounds.right
          );
        }),
      )
      .toBe(true);
  });

  test("keeps an image avatar at the full slot size", async ({ q }) => {
    const avatar = q.article("Image avatar").locator("img");
    await test.expect(avatar).toBeVisible();
    await test.expect
      .poll(() =>
        avatar.evaluate((image) => {
          const slot = image.closest(".overflow-clip");
          if (!slot) throw new Error("Avatar slot not found");
          const bounds = slot.getBoundingClientRect();
          const imageBounds = image.getBoundingClientRect();
          return (
            image.parentElement === slot &&
            Math.abs(imageBounds.width - bounds.width) < 1 &&
            Math.abs(imageBounds.height - bounds.height) < 1
          );
        }),
      )
      .toBe(true);
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
