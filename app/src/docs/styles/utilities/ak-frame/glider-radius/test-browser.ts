import type { Locator, Page } from "@playwright/test";
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

// The scrubber reads the end once a scrub or a replay ends, and the box must
// show the end on the frame that follows. A box that still traveled at 0.1×
// would be on its way for more than a second, so it's read once, not polled.
async function getEndOffset(page: Page, figure: Locator, tab: Locator) {
  // The figure reads the box on the next frame and draws it after that frame.
  await flushFrames(page);
  return getBoxOffset(figure, tab);
}

// Records the time from the next press on the page to the change that makes the
// Time scrubber read the end, both on the clock of the page. The time that
// Playwright takes to send the press and to read the scrubber then doesn't
// count. A scrubber that reads the end before the press must leave it first.
function recordPlayback(time: Locator) {
  return time.evaluateHandle((slider) => {
    const isAtEnd = () => slider.getAttribute("aria-valuetext") === "100%";
    const duration = new Promise<number>((resolve) => {
      let start: number | null = null;
      let left = !isAtEnd();
      const onPress = (event: Event) => {
        start = event.timeStamp;
      };
      slider.ownerDocument.addEventListener("pointerdown", onPress, {
        capture: true,
        once: true,
      });
      const observer = new MutationObserver(() => {
        if (start == null) return;
        if (!isAtEnd()) {
          left = true;
          return;
        }
        if (!left) return;
        observer.disconnect();
        resolve(performance.now() - start);
      });
      observer.observe(slider, {
        attributes: true,
        attributeFilter: ["aria-valuetext"],
      });
    });
    return { duration };
  });
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
    // The figure gives the travel its speed when the selection changes the
    // subject, before the travel draws a frame, so at 0.1× it takes 2s. A slow
    // runner only makes it take longer. The bound is half of the 2s, like the
    // one of the replay below.
    const travel = await recordPlayback(time);
    await q.tab("Members").click();
    await test.expect(q.button("Replay")).toBeEnabled();
    await test
      .expect(time)
      .toHaveAttribute("aria-valuetext", "100%", { timeout: 5000 });
    test
      .expect(await travel.evaluate((record) => record.duration))
      .toBeGreaterThan(1000);
    await test.expect
      .poll(() => getBoxOffset(figure, q.tab("Members")))
      .toBeCloseTo(0, 0);

    // A replay starts at the start of the travel with the speed, so it takes 2s
    // at 0.1× and 200ms at 1×. A slow runner only makes it take longer. The
    // bound is half of the 2s, since WebKit can date an animation back to its
    // last frame, as it does for the transitions of a travel.
    const replay = await recordPlayback(time);
    await q.button("Replay").click();
    await test
      .expect(time)
      .toHaveAttribute("aria-valuetext", "100%", { timeout: 5000 });
    test
      .expect(await replay.evaluate((record) => record.duration))
      .toBeGreaterThan(1000);

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
    // A finished travel that played again at 0.25× would move the box for 800ms
    // from the frame that applies the speed. The figure reads the box on that
    // frame and draws it after it, so the box must stay across two frames.
    await flushFrames(page);
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
    test
      .expect(await getEndOffset(page, figure, q.tab("Members")))
      .toBeCloseTo(0, 0);
  });

  test("shows the end of the travel when a faster replay of it ends", async ({
    page,
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
    test
      .expect(await getEndOffset(page, figure, q.tab("Members")))
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
    // A restyle starts the transitions on the next frame, the frame after it
    // sends their transitionrun events, and the scrubber shows a new time after
    // that frame. No state changes when the scrub stays.
    await flushFrames(page, 3);
    await test.expect(time).toHaveAttribute("aria-valuetext", "0%");
    // A press ends the scrub, and the box shows the end of the travel.
    await q.tab("Members").click();
    await test.expect(time).toHaveAttribute("aria-valuetext", "100%");
    test
      .expect(await getEndOffset(page, q.figure(), q.tab("Members")))
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
