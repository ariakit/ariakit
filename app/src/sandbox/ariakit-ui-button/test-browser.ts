import {
  captureInView,
  captureSections,
  expectFocusVisible,
  forEachColorScheme,
  getCapture,
  hoverOver,
  tabTo,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

function initialsFit(element: Element) {
  const slot = element.closest(".overflow-clip");
  if (!slot) {
    throw new Error("Avatar slot not found");
  }
  const range = element.ownerDocument.createRange();
  range.selectNodeContents(element);
  const text = range.getBoundingClientRect();
  const bounds = slot.getBoundingClientRect();
  return (
    Math.abs(bounds.width - bounds.height) < 1 &&
    text.left >= bounds.left &&
    text.right <= bounds.right
  );
}

function textHeight(element: Element) {
  const range = element.ownerDocument.createRange();
  range.selectNodeContents(element);
  return range.getBoundingClientRect().height;
}

withCaptures(import.meta.dirname, async ({ query, test }) => {
  // https://github.com/ariakit/ariakit/issues/7475
  test("fits two wide initials inside an avatar slot", async ({ q }) => {
    const initials = query(q.article("Initial avatar")).text("WW");
    await test.expect(initials).toBeVisible();
    await test.expect.poll(() => initials.evaluate(initialsFit)).toBe(true);
  });

  // https://github.com/ariakit/ariakit/pull/7489#discussion_r3997142100
  test("keeps large avatar initials at the label text size", async ({ q }) => {
    const example = query(q.article("Large avatar initials"));
    for (const [initials, name] of [
      ["AT", "Ava Thompson"],
      ["NP", "Noah Patel"],
    ] as const) {
      const avatar = example.text(initials);
      const label = example.text(name);
      await test.expect(avatar).toBeVisible();
      await test.expect(label).toBeVisible();
      await test.expect.poll(() => avatar.evaluate(initialsFit)).toBe(true);
      await test.expect
        .poll(async () => {
          const avatarHeight = await avatar.evaluate(textHeight);
          const labelHeight = await label.evaluate(textHeight);
          return Math.abs(avatarHeight - labelHeight);
        })
        .toBeLessThan(1);
    }
  });

  // https://github.com/ariakit/ariakit/issues/7475
  test("keeps avatar dimensions with normal line height", async ({ q }) => {
    const example = query(q.article("Avatar with normal line height"));
    const initials = example.text("WW");
    const label = example.text("Will Williams");
    await test.expect(initials).toBeVisible();
    await test.expect(label).toBeVisible();
    await test.expect
      .poll(async () => {
        const avatarHeight = await initials.evaluate((element) => {
          const slot = element.closest(".overflow-clip");
          if (!slot) throw new Error("Avatar slot not found");
          return slot.getBoundingClientRect().height;
        });
        const labelHeight = await label.evaluate(
          (element) => element.getBoundingClientRect().height,
        );
        return Math.abs(avatarHeight - labelHeight);
      })
      .toBeLessThan(1);
  });

  // https://github.com/ariakit/ariakit/pull/7489#discussion_r3995106162
  test("fits initials from adjacent expressions inside an avatar slot", async ({
    q,
  }) => {
    const initials = query(q.article("Composed avatar initials")).text("WW");
    await test.expect(initials).toBeVisible();
    await test.expect.poll(() => initials.evaluate(initialsFit)).toBe(true);
  });

  // https://github.com/ariakit/ariakit/pull/7489#discussion_r3995226168
  test("fits initials inside nested fragments in an avatar slot", async ({
    q,
  }) => {
    const initials = query(q.article("Fragment avatar initials")).text("WW");
    await test.expect(initials).toBeVisible();
    await test.expect.poll(() => initials.evaluate(initialsFit)).toBe(true);
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

  // The section captures also keep the static states of the button group
  // fixture under visual regression: joined borders, kept corners and the
  // selected glider.
  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3972227948
  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3974550181
  // https://github.com/ariakit/ariakit/issues/7466
  test("sections @visual", async ({ page, visual }) => {
    await forEachColorScheme(page, (colorScheme) =>
      captureSections(page, visual, colorScheme),
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
