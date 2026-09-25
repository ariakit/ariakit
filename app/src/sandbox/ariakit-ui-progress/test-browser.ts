import {
  captureInView,
  capturePage,
  expectMedia,
  forEachColorScheme,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

withCaptures(import.meta.dirname, async ({ query, test }) => {
  // https://github.com/ariakit/ariakit/issues/7480
  test("disables indeterminate progress animations with reduced motion", async ({
    page,
    q,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const name of [
      "Loading results",
      "Custom bar",
      "Loading preview",
      "Custom ring",
    ]) {
      const progress = q.progressbar(name);
      await test.expect(progress).not.toHaveAttribute("aria-valuenow");
      await test
        .expect(progress.locator(":scope > :first-child"))
        .toHaveCSS("animation-name", "none");
    }
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

    await q.button("Restart").click();
    await test.expect(bar).not.toHaveAttribute("aria-valuenow");
    await test.expect(ring).not.toHaveAttribute("aria-valuenow");
    await test.expect(barFill).toHaveCSS("animation-name", "ui-progress");
    await test.expect(ringFill).toHaveCSS("animation-name", "spin");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await test.expect(barFill).toHaveCSS("animation-name", "none");
    await test.expect(ringFill).toHaveCSS("animation-name", "none");
  });

  test("page @visual", async ({ page, visual }) => {
    await forEachColorScheme(page, (colorScheme) =>
      capturePage({
        page,
        visual,
        colorScheme,
        item: "ariakit-ui-progress/page",
      }),
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
      await captureInView({
        visual,
        box: q.article("Default"),
        colorScheme,
        item: "ariakit-ui-progress/forced-colors/bar",
      });
      await captureInView({
        visual,
        box: q.article("Ring with label"),
        colorScheme,
        item: "ariakit-ui-progress/forced-colors/ring",
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
      await captureInView({
        visual,
        box: q.article("Default"),
        colorScheme,
        item: "ariakit-ui-progress/high-contrast/bordered-track",
      });
      await captureInView({
        visual,
        box: q.article("Borderless track"),
        colorScheme,
        item: "ariakit-ui-progress/high-contrast/borderless-track",
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
      await captureInView({
        visual,
        box,
        colorScheme,
        item: "ariakit-ui-progress/value-change",
      });
    });
  });
});
