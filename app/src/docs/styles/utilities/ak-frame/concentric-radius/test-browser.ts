import type { Locator, Page } from "@playwright/test";
import { forEachColorScheme, getCapture } from "#app/test-utils/ariakit-ui.ts";
import {
  expectMeasure,
  getComputedLength,
  getRadiusCenter,
} from "#app/test-utils/measure.ts";
import { withDeferredVisualLoad } from "#app/test-utils/preview.ts";

// The figure shows the frames at 2×.
const ZOOM = 2;

async function setSlider(page: Page, slider: Locator, value: number) {
  await slider.focus();
  await page.keyboard.press("Home");
  for (let step = 0; step < value; step++) {
    await page.keyboard.press("ArrowRight");
  }
}

withDeferredVisualLoad(import.meta.dirname, async ({ id, test }) => {
  test("figure @visual", async ({ page, q, visual }) => {
    await forEachColorScheme(page, async (colorScheme) => {
      const figure = q.figure();
      await test.expect(figure.locator("[data-measure-label]")).toHaveCount(3);
      await visual(getCapture(figure, colorScheme, { item: `${id}/figure` }));
    });
  });

  test("shows the radii and the padding of the frames at 1×", async ({
    page,
    q,
  }) => {
    const figure = q.figure();
    const inner = q.text("Inner frame");
    const outer = inner.locator("xpath=..");
    for (const [radius, padding] of [
      [2, 2],
      [0, 0],
      [3, 4],
      [1, 1],
    ] as const) {
      await setSlider(page, q.slider("Outer radius"), radius);
      await setSlider(page, q.slider("Outer padding"), padding);
      await test.expect(q.slider("Outer padding")).toHaveValue(`${padding}`);
      const outerRadius = await getComputedLength(
        outer,
        "border-top-left-radius",
      );
      const innerRadius = await getComputedLength(
        inner,
        "border-top-left-radius",
      );
      const outerPadding = await getComputedLength(outer, "padding-top");
      await expectMeasure(figure, "Outer radius", outerRadius);
      await expectMeasure(figure, "Inner radius", innerRadius);
      await expectMeasure(figure, "Outer padding", outerPadding);
    }
  });

  // The frames are concentric, so both circles have the center that the outer
  // radius sets, at the zoom of the figure.
  test("draws both radii around one center at the zoom", async ({
    page,
    q,
  }) => {
    const figure = q.figure();
    const inner = q.text("Inner frame");
    const outer = inner.locator("xpath=..");
    await setSlider(page, q.slider("Outer radius"), 3);
    await setSlider(page, q.slider("Outer padding"), 3);
    await test.expect(q.slider("Outer padding")).toHaveValue("3");
    const outerRadius = await getComputedLength(
      outer,
      "border-top-left-radius",
    );
    await expectMeasure(figure, "Outer radius", outerRadius);
    const box = await outer.boundingBox();
    if (!box) throw new Error("The outer frame has no box");
    const expected = {
      x: box.x + outerRadius * ZOOM,
      y: box.y + outerRadius * ZOOM,
    };
    // Each part draws on its own frame after the slider changes.
    for (const name of ["Outer radius", "Inner radius"]) {
      const center = () => getRadiusCenter(figure, name);
      await test.expect
        .poll(async () => (await center()).x)
        .toBeCloseTo(expected.x, 0);
      await test.expect
        .poll(async () => (await center()).y)
        .toBeCloseTo(expected.y, 0);
    }
  });
});
