import type { Locator } from "@playwright/test";
import {
  capturePage,
  expectFocusVisible,
  forEachColorScheme,
  tabTo,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

// The drawn thumb is the last part in the track, which follows the input.
function getThumb(slider: Locator) {
  return slider.locator("xpath=following-sibling::*[1]/*[last()]");
}

async function getCenterX(element: Locator) {
  const box = await element.boundingBox();
  if (!box) throw new Error("The element has no box");
  return box.x + box.width / 2;
}

withCaptures(import.meta.dirname, async ({ query, test }) => {
  test("page @visual", async ({ page, visual }) => {
    await forEachColorScheme(page, (colorScheme) =>
      capturePage({
        page,
        visual,
        colorScheme,
        item: "ariakit-ui-slider/page",
      }),
    );
  });

  // Each engine maps the pointer to a value over the width of the input less
  // the width of its own thumb. When the drawn thumb has another size or
  // position, a press on it moves the value.
  test("puts the drawn thumb under the pointer that sets the value", async ({
    q,
  }) => {
    for (const { box, name, values } of [
      { box: "Default", name: "Volume", values: [10, 50, 90] },
      { box: "Right to left", name: "Balance", values: [90, 50, 10] },
    ]) {
      const slider = query(q.article(box)).slider(name);
      const thumb = getThumb(slider);
      const sliderBox = await slider.boundingBox();
      const thumbBox = await thumb.boundingBox();
      if (!sliderBox || !thumbBox) throw new Error("The slider has no box");
      const travel = sliderBox.width - thumbBox.width;
      for (const [index, ratio] of [0.1, 0.5, 0.9].entries()) {
        const x = thumbBox.width / 2 + ratio * travel;
        const y = sliderBox.height / 2;
        await slider.click({ position: { x, y } });
        await test.expect(slider).toHaveValue(`${values[index]}`);
        test.expect(await getCenterX(thumb)).toBeCloseTo(sliderBox.x + x, 0);
      }
    }
  });

  test("shows the focus ring on the thumb when the input has keyboard focus", async ({
    page,
    q,
  }) => {
    const slider = query(q.article("Default")).slider("Volume");
    const thumb = getThumb(slider);
    await test.expect(thumb).toHaveCSS("outline-style", "none");
    await tabTo(page, slider);
    await expectFocusVisible(slider);
    await test.expect(thumb).toHaveCSS("outline-style", "solid");
    await test.expect(thumb).toHaveCSS("outline-width", "2px");
  });

  // Safari focuses a range input on click only when it has a tab index.
  test("moves the value with arrow keys after a click", async ({ page, q }) => {
    const slider = query(q.article("Default")).slider("Volume");
    await slider.click();
    await test.expect(slider).toBeFocused();
    await test.expect(slider).toHaveValue("50");
    await page.keyboard.press("ArrowRight");
    await test.expect(slider).toHaveValue("51");
  });

  // The thumb reads the focus of its own input, not the focus of an element
  // before the slider.
  test("shows no focus ring on the thumb when a field before it has focus", async ({
    page,
    q,
  }) => {
    const scope = query(q.article("Number field"));
    const field = scope.spinbutton("Opacity percent");
    const thumb = getThumb(scope.slider("Opacity"));
    await tabTo(page, field);
    await expectFocusVisible(field);
    await test.expect(thumb).toHaveCSS("outline-style", "none");
  });
});
