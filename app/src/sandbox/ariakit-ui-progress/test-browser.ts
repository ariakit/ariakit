import {
  captureInView,
  capturePage,
  expectMedia,
  forEachColorScheme,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

withCaptures(import.meta.dirname, async ({ query, test }) => {
  test("page @visual", async ({ page, visual }) => {
    await forEachColorScheme(page, (colorScheme) =>
      capturePage(page, visual, colorScheme),
    );
  });

  // Forced colors repaint every background in the system canvas and drop
  // box-shadows and gradients, which used to leave nothing of a bar or a ring.
  test("keeps bars and rings visible in forced colors @visual", async ({
    page,
    q,
    visual,
  }) => {
    // The emulation lasts across the reloads of each color scheme.
    await page.emulateMedia({ forcedColors: "active" });
    await forEachColorScheme(page, async (colorScheme) => {
      await expectMedia(page, "(forced-colors: active)");
      await captureInView(visual, q.article("Default"), colorScheme, {
        id: "bar",
      });
      await captureInView(visual, q.article("Ring with label"), colorScheme, {
        id: "ring",
      });
    });
  });

  // The track's inset ring used to read the border width of the bordered
  // example box around it, so $border={false} still drew the edge where the
  // edge shows: in high contrast.
  test("draws the track edge only on a bordered track in high contrast @visual", async ({
    page,
    q,
    visual,
  }) => {
    await page.emulateMedia({ contrast: "more" });
    await forEachColorScheme(page, async (colorScheme) => {
      await expectMedia(page, "(prefers-contrast: more)");
      await captureInView(visual, q.article("Default"), colorScheme, {
        id: "bordered",
      });
      await captureInView(visual, q.article("Borderless track"), colorScheme, {
        id: "borderless",
      });
    });
  });

  // The fill animates toward each value, and the capture disables animations,
  // so it shows where the bar and the ring settle.
  test("moves the bar and the ring to a new value @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorScheme(page, async (colorScheme) => {
      const box = q.article("Value change");
      const scope = query(box);
      await scope.button("Advance").click();
      await test
        .expect(scope.progressbar("Build bar"))
        .toHaveAttribute("aria-valuenow", "0.5");
      await captureInView(visual, box, colorScheme);
    });
  });
});
