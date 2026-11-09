import { flushFrames, withFramework } from "#app/test-utils/preview.ts";
import {
  expectMove,
  expectNoMove,
  getSelectedSlide,
  waitPastDelay,
} from "./test-helpers.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  test("moves to the next slide after the delay", async ({ q }) => {
    const carousel = query(q.region("Previews"));
    await test
      .expect(carousel.tab("Slide 1"))
      .toHaveAttribute("aria-selected", "true");
    await test
      .expect(carousel.tab("Slide 2"))
      .toHaveAttribute("aria-selected", "true");
  });

  test("keeps screen readers quiet while it plays", async ({ q }) => {
    const region = q.region("Previews");
    const status = region.locator("[aria-live]");
    await test.expect(status).toHaveAttribute("aria-live", "off");
    await query(region).button("Stop automatic slide show").click();
    await test.expect(status).toHaveAttribute("aria-live", "polite");
  });

  test("speaks the slide position while focus pauses autoplay", async ({
    q,
  }) => {
    const region = q.region("Previews");
    const status = region.locator("[aria-live]");
    await test.expect(status).toHaveAttribute("aria-live", "off");
    await query(region).button("Previous slide").focus();
    await test.expect(status).toHaveAttribute("aria-live", "polite");
    await q.button("Outside").focus();
    await test.expect(status).toHaveAttribute("aria-live", "off");
  });

  test("holds on a slide until the next one is ready", async ({ page, q }) => {
    const region = q.region("Projects");
    const carousel = query(region);
    // At the end of the delay, autoplay asks for the second slide, which
    // renders its lazy content but isn't ready.
    await test.expect(carousel.heading("Mobile app")).toHaveCount(1);
    await expectNoMove(page, region);
    await test
      .expect(carousel.tab("Slide 1"))
      .toHaveAttribute("aria-selected", "true");
    await q.checkbox("Mobile app").check();
    await test
      .expect(carousel.tab("Slide 2"))
      .toHaveAttribute("aria-selected", "true");
  });

  test("renders a lazy slide only when autoplay asks for it", async ({ q }) => {
    const carousel = query(q.region("Projects"));
    await test.expect(carousel.heading("Dashboard")).toBeVisible();
    await test.expect(carousel.heading("Mobile app")).toHaveCount(0);
    await test.expect(carousel.heading("Mobile app")).toHaveCount(1);
    await test.expect(carousel.heading("Design system")).toHaveCount(0);
  });

  test("goes back to the first slide after the last", async ({ q }) => {
    const carousel = query(q.region("Projects"));
    await q.checkbox("Mobile app").check();
    await q.checkbox("Design system").check();
    await q.checkbox("Billing").check();
    await test
      .expect(carousel.tab("Slide 4"))
      .toHaveAttribute("aria-selected", "true");
    await test
      .expect(carousel.tab("Slide 1"))
      .toHaveAttribute("aria-selected", "true");
  });

  test("pauses while the pointer is over the carousel", async ({ page, q }) => {
    const region = q.region("Previews");
    // The previous button area is part of the carousel, not of a slide iframe.
    await query(region).button("Previous slide").hover();
    await expectNoMove(page, region);
    await page.mouse.move(0, 0);
    await expectMove(region);
  });

  test("pauses while focus is inside the carousel", async ({ page, q }) => {
    const region = q.region("Previews");
    await query(region).button("Previous slide").focus();
    await expectNoMove(page, region);
    await q.button("Outside").focus();
    await expectMove(region);
  });

  test("restarts the delay after the carousel shows again", async ({
    page,
    q,
  }) => {
    const region = q.region("Previews");
    await q.button("Hide previews").click();
    await test.expect(region).toBeHidden();
    // A delay that ended while the carousel was hidden would have no slide to
    // move to.
    await waitPastDelay(page);
    await q.button("Show previews").click();
    await test.expect(region).toBeVisible();
    // The page centers its content, so the carousel can show under the pointer,
    // which would pause autoplay.
    await page.mouse.move(0, 0);
    await expectMove(region);
  });

  test("goes back to the first slide after the last view", async ({ q }) => {
    const carousel = query(q.region("People"));
    // Two slides show at once, so the last view starts at the fourth slide.
    await test
      .expect(carousel.tab("Slide 4"))
      .toHaveAttribute("aria-selected", "true", { timeout: 10_000 });
    await test
      .expect(carousel.tab("Slide 1"))
      .toHaveAttribute("aria-selected", "true");
    await test
      .expect(carousel.button("Stop automatic slide show"))
      .toBeVisible();
  });

  test("keeps the slide that it moved to at the last view", async ({
    page,
    q,
  }) => {
    const region = q.region("People");
    const carousel = query(region);
    await test
      .expect(carousel.tab("Slide 4"))
      .toHaveAttribute("aria-selected", "true", { timeout: 10_000 });
    // The move to the last view ends at the end of the row.
    await test.expect(carousel.button("Next slide")).toBeDisabled();
    // A change that must not happen leaves no state to wait for, and the
    // carousel reads the scroll position on the frame after the last scroll
    // event. The next move waits for the autoplay delay.
    await flushFrames(page);
    test.expect(await getSelectedSlide(region)).toBe("Slide 4");
  });

  test("plays again after autoplay turns on once the pointer left", async ({
    page,
    q,
  }) => {
    const region = q.region("People");
    const autoPlay = q.checkbox("Autoplay");
    await query(region).button("Previous slide").hover();
    // The pointer stays on the carousel while the keyboard turns autoplay off,
    // then leaves it while autoplay is off.
    await autoPlay.focus();
    await page.keyboard.press("Space");
    await test.expect(autoPlay).not.toBeChecked();
    await page.mouse.move(0, 0);
    await page.keyboard.press("Space");
    await test.expect(autoPlay).toBeChecked();
    await expectMove(region);
  });

  test("plays when autoplay turns on after a move while it was off", async ({
    page,
    q,
  }) => {
    const region = q.region("People");
    const carousel = query(region);
    const autoPlay = q.checkbox("Autoplay");
    await autoPlay.uncheck();
    // A move while autoplay is off doesn't stop autoplay for later.
    await carousel.button("Next slide").click();
    await page.mouse.move(0, 0);
    await autoPlay.check();
    await test
      .expect(carousel.button("Stop automatic slide show"))
      .toBeVisible();
    await expectMove(region);
  });

  test("stays paused when autoplay turns on under the pointer", async ({
    page,
    q,
  }) => {
    const region = q.region("People");
    const autoPlay = q.checkbox("Autoplay");
    await autoPlay.focus();
    await page.keyboard.press("Space");
    await test.expect(autoPlay).not.toBeChecked();
    // The pointer comes to the carousel while autoplay is off, so autoplay
    // starts paused when the keyboard turns it on again.
    await query(region).button("Previous slide").hover();
    await page.keyboard.press("Space");
    await test.expect(autoPlay).toBeChecked();
    await expectNoMove(page, region);
  });

  test("restarts the delay once the slides overflow again", async ({
    page,
    q,
  }) => {
    const region = q.region("Previews");
    await q.button("Fit all previews").click();
    // A delay that ended while every slide fit would have no slide to move to.
    await waitPastDelay(page);
    await q.button("Show one preview").click();
    await page.mouse.move(0, 0);
    await expectMove(region);
  });

  test("plays once the slides overflow a little after they all fit", async ({
    page,
    q,
  }) => {
    const region = q.region("Previews");
    await q.button("Fit all previews").click();
    // While every slide fits, there's no slide to move to, so the delay doesn't
    // count.
    await waitPastDelay(page);
    // The row overflows by less than half a slide, so the same slides show.
    await q.button("Almost fit all previews").click();
    await page.mouse.move(0, 0);
    await expectMove(region);
  });

  test("stops after a press on the tab of the slide that shows", async ({
    q,
  }) => {
    // Autoplay holds on the first slide until the second one is ready.
    const carousel = query(q.region("Projects"));
    const tab = carousel.tab("Slide 1");
    await test.expect(tab).toHaveAttribute("aria-selected", "true");
    await tab.click();
    await test
      .expect(carousel.button("Start automatic slide show"))
      .toBeVisible();
  });

  test("stops after a slide tab", async ({ page, q }) => {
    const region = q.region("Projects");
    const carousel = query(region);
    await carousel.tab("Slide 3").click();
    await test
      .expect(carousel.button("Start automatic slide show"))
      .toBeVisible();
    // Every slide is ready, so only the stop keeps autoplay from moving.
    await q.checkbox("Mobile app").check();
    await q.checkbox("Design system").check();
    await q.checkbox("Billing").check();
    await expectNoMove(page, region);
  });

  test("stops after a screen reader presses the next button", async ({
    page,
    q,
  }) => {
    const region = q.region("Previews");
    const carousel = query(region);
    // Screen readers can activate a button with a click event alone.
    await carousel.button("Next slide").dispatchEvent("click");
    await test
      .expect(carousel.button("Start automatic slide show"))
      .toBeVisible();
    await expectNoMove(page, region);
  });

  test("goes on from the slide that a wheel moved to", async ({ page, q }) => {
    const region = q.region("People");
    const carousel = query(region);
    const box = await region.boundingBox();
    if (!box) throw new Error("The carousel has no box");
    // The pointer rests over the slides, which pauses autoplay, so only the
    // wheel moves them. The hover measures the carousel again, because the
    // content above it can still move when the page loads.
    await region.hover({ position: { x: box.width / 2, y: box.height / 3 } });
    const slide = await getSelectedSlide(region);
    await page.mouse.wheel(400, 0);
    await test.expect.poll(() => getSelectedSlide(region)).not.toBe(slide);
    // The row snaps after the wheel, which leaves no state to wait for, and
    // autoplay stays paused under the pointer, so the wait past one delay lets
    // the snap end before the selection is read again.
    await waitPastDelay(page);
    await test
      .expect(carousel.button("Stop automatic slide show"))
      .toBeVisible();
    await page.mouse.move(0, 0);
    await expectMove(region);
  });

  test("goes on after a wheel stops the row just before a slide", async ({
    page,
    q,
  }) => {
    const region = q.region("Places");
    const box = await region.boundingBox();
    if (!box) throw new Error("The carousel has no box");
    // The pointer rests over the slides, which pauses autoplay. A move that
    // started before the pointer came ends during the wait.
    await region.hover({ position: { x: box.width / 2, y: box.height / 3 } });
    await waitPastDelay(page);
    const slide = await getSelectedSlide(region);
    // The row doesn't snap, so the wheel stops it a little before the start of
    // a slide. That slide is the nearest one, so it's selected.
    await page.mouse.wheel(400, 0);
    await test.expect.poll(() => getSelectedSlide(region)).not.toBe(slide);
    // The wheel scrolls smoothly, which leaves no state to wait for, and
    // autoplay stays paused under the pointer, so the wait past one delay lets
    // the scroll end before the selection is read again.
    await waitPastDelay(page);
    await page.mouse.move(0, 0);
    await expectMove(region);
  });

  test("renders the lazy slides of a row at once", async ({ q }) => {
    const row = query(q.group("Tags"));
    // The last slide lies mostly past the end of the row, out of view.
    await test.expect(row.heading("Design")).toBeVisible();
    await test.expect(row.heading("Docs")).toHaveCount(1);
  });

  test("takes a press just beside the play button", async ({ q }) => {
    const carousel = query(q.region("Previews"));
    const play = carousel.button("Stop automatic slide show");
    const box = await play.boundingBox();
    test.expect(box).not.toBeNull();
    if (!box) return;
    // A press just below the play button lands in its padding, over the hit
    // area of the previous button.
    await play.click({ position: { x: box.width / 2, y: box.height + 4 } });
    await test
      .expect(carousel.button("Start automatic slide show"))
      .toBeVisible();
  });

  test("starts again at once with the play button", async ({ page, q }) => {
    const region = q.region("Previews");
    const carousel = query(region);
    await carousel.button("Stop automatic slide show").click();
    await expectNoMove(page, region);
    // The pointer stays on the carousel, which pauses autoplay, but the start
    // plays it anyway.
    await carousel.button("Start automatic slide show").click();
    await expectMove(region);
    // The next hover pauses autoplay again.
    await page.mouse.move(0, 0);
    await query(region).button("Previous slide").hover();
    await expectNoMove(page, region);
  });

  test("starts at once with the keyboard while focus stays", async ({
    page,
    q,
  }) => {
    const region = q.region("Previews");
    const carousel = query(region);
    await carousel.button("Stop automatic slide show").focus();
    await page.keyboard.press("Enter");
    await test
      .expect(carousel.button("Start automatic slide show"))
      .toBeFocused();
    await expectNoMove(page, region);
    await page.keyboard.press("Enter");
    await test
      .expect(carousel.button("Stop automatic slide show"))
      .toBeFocused();
    await expectMove(region);
  });

  test.describe("with reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("doesn't start until the person starts it", async ({ page, q }) => {
      const region = q.region("Previews");
      const carousel = query(region);
      await test
        .expect(carousel.button("Start automatic slide show"))
        .toBeVisible();
      await expectNoMove(page, region);
      await carousel.button("Start automatic slide show").click();
      await expectMove(region);
    });
  });
});
