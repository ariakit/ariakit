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
  // https://github.com/ariakit/ariakit/pull/7536#discussion_r4023546236
  test("keeps horizontal bar groups and their focus outline unclipped", async ({
    q,
    page,
  }) => {
    const group = q.radiogroup("Horizontal size");
    const small = query(group).radio("Small");
    await small.click();
    await page.keyboard.press("ArrowRight");
    await test.expect(query(group).radio("Large")).toBeFocused();
    await test
      .expect(group.locator(".glider.focus"))
      .toHaveCSS("outline-style", "solid");
    await test.expect(group).not.toHaveCSS("box-shadow", "none");
    await test.expect(group).toHaveCSS("clip-path", "none");
  });

  // Each engine rounds the half-leading of a line box its own way, so the badge
  // text centers only once its box is trimmed to the capitals. No layout API
  // reports where the capitals are, so a probe as tall as them sits on the text
  // baseline.
  // https://github.com/ariakit/ariakit/issues/7588
  test("centers the badge text in its slot", async ({ q }) => {
    const text = query(q.article("Count badge")).text("12");
    await test.expect(text).toBeVisible();
    const offset = await text.evaluate((node) => {
      const slot = node.parentElement;
      if (!slot) {
        throw new Error("Missing badge slot");
      }
      const probe = node.ownerDocument.createElement("span");
      probe.style.display = "inline-block";
      probe.style.height = "1cap";
      node.append(probe);
      const caps = probe.getBoundingClientRect();
      probe.remove();
      const box = slot.getBoundingClientRect();
      return box.top + box.height / 2 - (caps.top + caps.height / 2);
    });
    test.expect(offset).toBeCloseTo(0, 1);
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

  test("animates the bar between rows in a vertical group", async ({
    q,
    browserName,
  }) => {
    test.skip(
      browserName === "firefox",
      "Firefox does not transition this anchor change, including with the original inset rule.",
    );
    const example = q.article("Vertical bar glider");
    const system = query(example).radio("System");
    const dark = query(example).radio("Dark");
    const bar = example.locator(".glider");
    await example.scrollIntoViewIfNeeded();
    await test.expect(system).toBeChecked();
    const start = await system.boundingBox();
    const end = await dark.boundingBox();
    if (!start || !end) throw new Error("Missing radio bounds");
    // Hold the real position transition halfway through so its short default
    // duration cannot finish before the geometry assertion reaches the browser.
    await bar.evaluate((node) => {
      node.addEventListener("transitionrun", (event) => {
        if (!(event instanceof TransitionEvent)) return;
        if (event.propertyName !== "top" && event.propertyName !== "bottom")
          return;
        for (const animation of node.getAnimations()) {
          if (!(animation instanceof CSSTransition)) continue;
          if (animation.transitionProperty !== event.propertyName) continue;
          animation.pause();
          animation.currentTime =
            Number(animation.effect?.getTiming().duration) / 2;
        }
      });
    });
    await dark.click();
    await test.expect(dark).toBeChecked();
    await test.expect
      .poll(async () => (await bar.boundingBox())?.y)
      .toBeGreaterThan(start.y);
    await test.expect
      .poll(async () => (await bar.boundingBox())?.y)
      .toBeLessThan(end.y);
    await bar.evaluate((node) => {
      for (const animation of node.getAnimations()) animation.finish();
    });
    await test.expect
      .poll(async () => (await bar.boundingBox())?.y)
      .toBeCloseTo(end.y, 0);
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
