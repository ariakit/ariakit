import {
  captureInView,
  captureSections,
  expectMedia,
  forEachColorScheme,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

withCaptures(import.meta.dirname, async ({ query, test }) => {
  // https://github.com/ariakit/ariakit/issues/7480
  test("colors the fill without changing the track", async ({ page, q }) => {
    await forEachColorScheme(page, async () => {
      const colors = new Set<string>();
      const tracks = new Set<string>();
      for (const color of ["success", "warning", "danger"]) {
        const bar = q.progressbar(`${color} bar`);
        const ring = q.progressbar(`${color} ring`);
        const barFill = bar.locator(":scope > :first-child");
        const ringFill = ring.locator(":scope > :first-child");
        const fillColor = await barFill.evaluate((node) =>
          getComputedStyle(node).getPropertyValue("--ak-layer"),
        );
        colors.add(fillColor);
        tracks.add(
          await bar.evaluate((node) => getComputedStyle(node).backgroundColor),
        );
        await test.expect(ringFill).toHaveCSS("--ak-layer", fillColor);
        await test.expect(barFill).toHaveCSS("background-color", fillColor);
        await test.expect(ringFill).not.toHaveCSS("background-image", "none");
      }
      test.expect(colors.size).toBe(3);
      test.expect(tracks.size).toBe(1);
    });
  });

  // https://github.com/ariakit/ariakit/issues/7480
  test("shows a fixed segment and arc with reduced motion", async ({
    page,
    q,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const name of ["Loading results", "Custom bar"]) {
      const bar = q.progressbar(name);
      const fill = bar.locator(":scope > :first-child");
      await test.expect(bar).not.toHaveAttribute("aria-valuenow");
      await test.expect(fill).toHaveCSS("animation-name", "none");
      await test.expect
        .poll(() =>
          fill.evaluate((node) => {
            const track = node.parentElement;
            if (!track) return;
            const trackRect = track.getBoundingClientRect();
            const fillRect = node.getBoundingClientRect();
            return {
              width: fillRect.width / trackRect.width,
              start: (fillRect.x - trackRect.x) / trackRect.width,
            };
          }),
        )
        .toEqual({
          width: test.expect.closeTo(1 / 3, 2),
          start: test.expect.closeTo(1 / 3, 2),
        });
      await test.expect(fill).toHaveCSS("translate", "100%");
    }
    for (const name of ["Loading preview", "Custom ring"]) {
      const ring = q.progressbar(name);
      const fill = ring.locator(":scope > :first-child");
      await test.expect(ring).not.toHaveAttribute("aria-valuenow");
      await test.expect(fill).toHaveCSS("animation-name", "none");
      await test.expect(fill).toHaveCSS("--progress-value", "0.25");
      await test.expect(fill).not.toHaveCSS("background-image", "none");
    }
    await test
      .expect(q.progressbar("Not started"))
      .toHaveAttribute("aria-valuenow", "0");
    await test
      .expect(q.progressbar("Not started"))
      .toHaveCSS("--progress-value", "0");
  });

  // https://github.com/ariakit/ariakit/issues/7480
  test("animates unknown progress and stops when the value is known", async ({
    page,
    q,
  }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    const bar = q.progressbar("Loading results");
    const ring = q.progressbar("Loading preview");
    const barFill = bar.locator(":scope > :first-child");
    const ringFill = ring.locator(":scope > :first-child");
    const rtlFill = q
      .progressbar("Custom bar")
      .locator(":scope > :first-child");
    const readMotion = () =>
      Promise.all([
        barFill.evaluate((node) => getComputedStyle(node).translate),
        ringFill.evaluate((node) => getComputedStyle(node).transform),
        rtlFill.evaluate((node) => getComputedStyle(node).translate),
      ]);
    await test.expect(barFill).toHaveCSS("animation-name", "ui-progress");
    await test.expect(ringFill).toHaveCSS("animation-name", "spin");
    await test.expect(rtlFill).toHaveCSS("animation-direction", "reverse");
    const initial = await readMotion();
    await test.expect
      .poll(async () => {
        const current = await readMotion();
        return current.every((value, index) => value !== initial[index]);
      })
      .toBe(true);

    await q.button("Set progress").click();
    for (const progress of [bar, ring]) {
      await test.expect(progress).toHaveAttribute("aria-valuenow", "0.6");
      await test
        .expect(progress.locator(":scope > :first-child"))
        .toHaveCSS("animation-name", "none");
    }
    await test.expect(barFill).toHaveCSS("translate", "none");
    await test.expect(ringFill).toHaveCSS("--progress-value", "0.6");

    await q.button("Restart").click();
    await test.expect(bar).not.toHaveAttribute("aria-valuenow");
    await test.expect(ring).not.toHaveAttribute("aria-valuenow");
    await test.expect(barFill).toHaveCSS("animation-name", "ui-progress");
    await test.expect(ringFill).toHaveCSS("animation-name", "spin");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await test.expect(barFill).toHaveCSS("animation-name", "none");
    await test.expect(ringFill).toHaveCSS("animation-name", "none");
  });

  test("sections @visual", async ({ page, visual }) => {
    await forEachColorScheme(page, (colorScheme) =>
      captureSections(page, visual, colorScheme),
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
