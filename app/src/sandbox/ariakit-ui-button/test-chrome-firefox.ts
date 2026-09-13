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
      const box = q.article("Control surfaces");
      for (const name of [
        "Sync now",
        "Skip sync",
        "Cancel sync",
        "Sync without border",
      ]) {
        await test
          .expect(query(box).button(name))
          .toHaveCSS("border-top-width", name === "Sync now" ? "1px" : "0px");
      }
      await captureInView(visual, box, colorScheme);
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
      const joined = q.article("Glider");
      await test
        .expect(joined.locator(".glider.selected"))
        .toHaveCSS("border-top-width", "2px");
      await captureInView(visual, joined, colorScheme, { id: "joined" });

      const links = q.article("Current link gliders");
      await hoverOver(query(links).link("Activity"));
      const hoverGlider = links.locator(".glider:not(.selected):not(.focus)");
      await test.expect(hoverGlider).toBeVisible();
      await test.expect(hoverGlider).toHaveCSS("border-top-width", "1px");
      await captureInView(visual, links, colorScheme, { id: "hover" });
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
      const box = q.article("Layer disabled");
      await test
        .expect(query(box).button("Cancel action"))
        .toHaveCSS("border-top-width", "0px");
      await test
        .expect(query(box).button("Apply action"))
        .toHaveCSS("border-top-width", "1px");
      await captureInView(visual, box, colorScheme);
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

  // https://github.com/ariakit/ariakit/issues/7476
  // https://github.com/ariakit/ariakit/pull/7500#discussion_r3996535606
  test("preserves explicit ring and inset button edges in forced colors @visual", async ({
    page,
    q,
    visual,
  }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await forEachColorScheme(page, async (colorScheme) => {
      const box = q.article("Ring borders");
      for (const [label, width] of [
        ["Export report", 1],
        ["Download report", 2],
        ["Save report", 1],
        ["Print report", 2],
      ] as const) {
        const button = query(box).button(label);
        await test.expect(button).toHaveCSS("border-top-width", `${width}px`);
        await test.expect(button).toHaveCSS("box-shadow", "none");
      }
      await captureInView(visual, box, colorScheme);
      const insetButton = query(box).button("Print report");
      await test.expect(insetButton).toHaveCSS("outline-style", "none");
      await tabTo(page, insetButton);
      await expectFocusVisible(insetButton);
      await test.expect(insetButton).toHaveCSS("outline-width", "2px");
      await test.expect(insetButton).toHaveCSS("border-top-width", "2px");
    });
  });
});
