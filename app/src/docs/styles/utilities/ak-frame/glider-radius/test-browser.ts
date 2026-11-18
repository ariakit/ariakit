import type { Locator } from "@playwright/test";
import { forEachColorScheme, getCapture } from "#app/test-utils/ariakit-ui.ts";
import {
  expectMeasure,
  getComputedLength,
  getRadiusCenter,
} from "#app/test-utils/measure.ts";
import {
  flushFrames,
  withDeferredVisualLoad,
} from "#app/test-utils/preview.ts";

// The figure shows the tabs at 1.5×.
const ZOOM = 1.5;

// The center of the box radius sits one radius in from the start corner of the
// box, so it follows the box as it travels.
async function getBoxOffset(figure: Locator, tab: Locator) {
  const box = await tab.boundingBox();
  if (!box) throw new Error("The tab has no box");
  const radius = await getComputedLength(tab, "border-top-left-radius");
  const center = await getRadiusCenter(figure, "Box radius");
  return center.x - (box.x + radius * ZOOM);
}

// The value of the Time scrubber, from 0 to 100.
async function getTimeValue(time: Locator) {
  return Number(await time.inputValue());
}

withDeferredVisualLoad(import.meta.dirname, async ({ id, test }) => {
  test("figure @visual", async ({ page, q, visual }) => {
    await forEachColorScheme(page, async (colorScheme) => {
      const figure = q.figure();
      await test.expect(figure.locator("[data-measure-label]")).toHaveCount(3);
      await visual(getCapture(figure, colorScheme, { item: `${id}/figure` }));
    });
  });

  test("shows the radii of the tab list and the box, and the padding, at 1×", async ({
    q,
  }) => {
    const figure = q.figure();
    const list = q.tablist("Section");
    for (const name of ["Members", "Overview"]) {
      const tab = q.tab(name);
      await tab.click();
      await test.expect(tab).toHaveAttribute("aria-selected", "true");
      // The box copies the frame of the selected tab.
      const tabRadius = await getComputedLength(tab, "border-top-left-radius");
      const listRadius = await getComputedLength(
        list,
        "border-top-left-radius",
      );
      const padding =
        (await getComputedLength(list, "padding-top")) +
        (await getComputedLength(list, "border-top-width"));
      await expectMeasure(figure, "Tab list radius", listRadius);
      await expectMeasure(figure, "Box radius", tabRadius);
      await expectMeasure(figure, "Tab list padding", padding);
      await test.expect.poll(() => getBoxOffset(figure, tab)).toBeCloseTo(0, 0);
    }
  });

  test("slows down, replays, and scrubs the travel of the box", async ({
    page,
    q,
  }) => {
    const figure = q.figure();
    const time = q.slider("Time");
    await test.expect(q.button("Replay")).toBeDisabled();
    // The speed is a radio group, so the arrow keys select a speed.
    await q.radio("1×", { exact: true }).focus();
    await page.keyboard.press("End");
    await test.expect(q.radio("0.1×", { exact: true })).toBeChecked();
    await q.tab("Members").click();
    await test.expect(q.button("Replay")).toBeEnabled();
    // The travel takes 200ms at 1× and 2s at 0.1×, and the scrubber shows its
    // time. The wait crosses the 200ms of a travel at 1×, where the scrubber
    // reads the end. At 0.1×, it reaches the end only after 2s, a margin for a
    // slow runner, where reading the box takes about 0.8s.
    await page.waitForTimeout(300);
    test.expect(await getTimeValue(time)).toBeLessThan(100);
    await test
      .expect(time)
      .toHaveAttribute("aria-valuetext", "100%", { timeout: 5000 });
    await test.expect
      .poll(() => getBoxOffset(figure, q.tab("Members")))
      .toBeCloseTo(0, 0);

    await q.button("Replay").click();
    // The replay runs at the speed too. The wait crosses the 200ms of a replay
    // at 1×, where the scrubber reads the end, while at 0.1× it reaches the end
    // only after 2s.
    await page.waitForTimeout(300);
    test.expect(await getTimeValue(time)).toBeLessThan(100);
    await test
      .expect(time)
      .toHaveAttribute("aria-valuetext", "100%", { timeout: 5000 });

    // WebKit starts new transitions when a finished transition plays again,
    // which a replay at full speed leaves on the path of the scrubber.
    await q.radio("0.1×", { exact: true }).focus();
    await page.keyboard.press("Home");
    await test.expect(q.radio("1×", { exact: true })).toBeChecked();
    await q.button("Replay").click();
    await test.expect(time).toHaveAttribute("aria-valuetext", "100%");

    // The scrubber moves the box back to the tab it left, and then to the tab
    // it went to. Home changes nothing while the travel is still at its start.
    await test.expect(time).not.toHaveAttribute("aria-valuetext", "0%");
    await time.focus();
    await page.keyboard.press("Home");
    await test.expect(time).toHaveAttribute("aria-valuetext", "0%");
    await test.expect
      .poll(() => getBoxOffset(figure, q.tab("Activity")))
      .toBeCloseTo(0, 0);
    await page.keyboard.press("End");
    await test.expect(time).toHaveAttribute("aria-valuetext", "100%");
    await test.expect
      .poll(() => getBoxOffset(figure, q.tab("Members")))
      .toBeCloseTo(0, 0);

    // A scrub holds the box on its way. Selecting a tab after it lets the box
    // travel to the tab.
    await page.keyboard.press("Home");
    for (let step = 0; step < 50; step++) {
      await page.keyboard.press("ArrowRight");
    }
    await test.expect(time).toHaveAttribute("aria-valuetext", "50%");
    await q.tab("Overview").click();
    await test
      .expect(q.tab("Overview"))
      .toHaveAttribute("aria-selected", "true");
    await test.expect(time).toHaveAttribute("aria-valuetext", "100%");
    await test.expect
      .poll(() => getBoxOffset(figure, q.tab("Overview")))
      .toBeCloseTo(0, 0);
  });

  test("keeps a finished travel at its end when the speed changes", async ({
    page,
    q,
  }) => {
    const figure = q.figure();
    await q.tab("Members").click();
    // The controls turn on when the travel starts, and the box then reaches the
    // tab.
    await test.expect(q.button("Replay")).toBeEnabled();
    await test.expect
      .poll(() => getBoxOffset(figure, q.tab("Members")))
      .toBeCloseTo(0, 0);
    await q.radio("0.25×", { exact: true }).click();
    await test.expect(q.radio("0.25×", { exact: true })).toBeChecked();
    // A finished travel that played again at 0.25× would take 800ms. The box
    // must stay, so cross part of that time.
    await page.waitForTimeout(300);
    test.expect(await getBoxOffset(figure, q.tab("Members"))).toBeCloseTo(0, 0);
  });

  test("shows the end of the travel when a key ends a scrub", async ({
    page,
    q,
  }) => {
    const figure = q.figure();
    const time = q.slider("Time");
    await q.radio("0.1×", { exact: true }).click();
    await q.tab("Members").click();
    await test.expect(q.button("Replay")).toBeEnabled();
    // Home changes nothing while the travel is still at its start.
    await test.expect(time).not.toHaveAttribute("aria-valuetext", "0%");
    await time.focus();
    await page.keyboard.press("Home");
    await test.expect(time).toHaveAttribute("aria-valuetext", "0%");
    // A key on the selected tab changes nothing, but it ends the scrub. The
    // travel that still runs under it ends too.
    await q.tab("Members").focus();
    await page.keyboard.press("Shift");
    await test.expect(time).toHaveAttribute("aria-valuetext", "100%");
    // At 0.1×, the rest of the travel takes more than a second, so a box that
    // still traveled would miss this time.
    await test.expect
      .poll(() => getBoxOffset(figure, q.tab("Members")), { timeout: 500 })
      .toBeCloseTo(0, 0);
  });

  test("shows the end of the travel when a faster replay of it ends", async ({
    q,
  }) => {
    const figure = q.figure();
    const time = q.slider("Time");
    await q.radio("0.1×", { exact: true }).click();
    await q.tab("Members").click();
    await test.expect(q.button("Replay")).toBeEnabled();
    await test.expect(time).not.toHaveAttribute("aria-valuetext", "0%");
    // The travel still runs at 0.1× when the replay starts at 1×.
    await q.button("Replay").click();
    await q.radio("1×", { exact: true }).click();
    await test.expect(time).toHaveAttribute("aria-valuetext", "100%");
    // At 0.1×, the rest of the travel takes more than a second, so a box that
    // still traveled would miss this time.
    await test.expect
      .poll(() => getBoxOffset(figure, q.tab("Members")), { timeout: 500 })
      .toBeCloseTo(0, 0);
  });

  // Firefox starts the transitions again when the subject restyles under a
  // replay, such as on a hover. That is no new change, so the scrub stays.
  test("keeps a scrub while the pointer moves over the subject", async ({
    page,
    q,
  }) => {
    const time = q.slider("Time");
    await q.radio("0.1×", { exact: true }).click();
    await q.tab("Members").click();
    await test.expect(q.button("Replay")).toBeEnabled();
    // Home changes nothing while the travel is still at its start.
    await test.expect(time).not.toHaveAttribute("aria-valuetext", "0%");
    await time.focus();
    await page.keyboard.press("Home");
    await test.expect(time).toHaveAttribute("aria-valuetext", "0%");
    await q.tab("Overview").hover();
    await page.mouse.move(0, 0);
    // The transitions that a restyle would start move the scrubber on the next
    // frames, so cross a few of them.
    await page.waitForTimeout(300);
    await test.expect(time).toHaveAttribute("aria-valuetext", "0%");
    // A press ends the scrub, and the box shows the end of the travel.
    await q.tab("Members").click();
    await test.expect(time).toHaveAttribute("aria-valuetext", "100%");
    await test.expect
      .poll(() => getBoxOffset(q.figure(), q.tab("Members")), { timeout: 500 })
      .toBeCloseTo(0, 0);
  });

  // The glider removes the elements that travel when reduced motion or forced
  // colors turn on, so the transitions of the last change can't run again.
  for (const { name, media } of [
    { name: "reduced motion", media: { reducedMotion: "reduce" } },
    { name: "forced colors mode", media: { forcedColors: "active" } },
  ] as const) {
    test(`turns the playback off when ${name} turns on`, async ({
      page,
      q,
    }) => {
      await q.tab("Members").click();
      await test.expect(q.button("Replay")).toBeEnabled();
      await test.expect(q.slider("Time")).toBeEnabled();
      await page.emulateMedia(media);
      await test.expect(q.button("Replay")).toBeDisabled();
      await test.expect(q.slider("Time")).toBeDisabled();
      // The controls wait for the next transition after the motion turns on
      // again. The glider sets up again on the next frames, which start none.
      // Explicit values, because null falls back to the setting of the system,
      // which can reduce motion on a CI runner.
      await page.emulateMedia({
        reducedMotion: "no-preference",
        forcedColors: "none",
      });
      await flushFrames(page);
      await test.expect(q.button("Replay")).toBeDisabled();
      await q.tab("Overview").click();
      await test.expect(q.button("Replay")).toBeEnabled();
    });
  }

  // With reduced motion, the glider stays off, and the tab paints its own box.
  // The page loads with it, as it does for a reader who turned it on.
  test.describe("with reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("keeps the playback off and measures the tab", async ({ q }) => {
      const figure = q.figure();
      const tab = q.tab("Members");
      await tab.click();
      await test.expect(tab).toHaveAttribute("aria-selected", "true");
      const tabRadius = await getComputedLength(tab, "border-top-left-radius");
      await expectMeasure(figure, "Box radius", tabRadius);
      await test.expect.poll(() => getBoxOffset(figure, tab)).toBeCloseTo(0, 0);
      await test.expect(q.button("Replay")).toBeDisabled();
      await test.expect(q.slider("Time")).toBeDisabled();
    });
  });
});
