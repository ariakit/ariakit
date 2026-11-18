import type { Locator } from "@playwright/test";
import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

// The drawn thumb is the last part in the track, which follows the input.
function getThumb(slider: Locator) {
  return slider.locator("xpath=following-sibling::*[1]/*[last()]");
}

async function getCenterX(element: Locator) {
  const box = await element.boundingBox();
  if (!box) throw new Error("The element has no box");
  return box.x + box.width / 2;
}

withFramework(import.meta.dirname, async ({ query, test }) => {
  test("moves the thumb with a controlled value", async ({ page, q }) => {
    const scope = query(q.article("Value"));
    const slider = scope.slider("Radius");
    const thumb = getThumb(slider);
    await test.expect(scope.text("lg")).toBeVisible();
    const before = await getCenterX(thumb);
    await slider.focus();
    await page.keyboard.press("ArrowLeft");
    await test.expect(slider).toHaveValue("1");
    await test.expect(scope.text("md")).toBeVisible();
    // Each step is a third of the travel.
    const sliderBox = await slider.boundingBox();
    const thumbBox = await thumb.boundingBox();
    if (!sliderBox || !thumbBox) throw new Error("The slider has no box");
    const step = (sliderBox.width - thumbBox.width) / 3;
    test.expect(await getCenterX(thumb)).toBeCloseTo(before - step, 0);
  });

  // At the limit, a key press changes the input but not the value prop, so only
  // the input that React puts back can return the thumb to 80.
  test("keeps the thumb at a value that the parent limits", async ({
    page,
    q,
  }) => {
    const scope = query(q.article("Limited value"));
    const slider = scope.slider("Limited volume");
    const thumb = getThumb(slider);
    await slider.focus();
    await page.keyboard.press("End");
    await test.expect(scope.text("Volume 80")).toBeVisible();
    await test.expect(slider).toHaveValue("80");
    const atLimit = await getCenterX(thumb);
    await page.keyboard.press("ArrowRight");
    await test.expect(slider).toHaveValue("80");
    // The thumb must not move, and no state changes when it stays, so cross the
    // frames that a wrong position would render in.
    await flushFrames(page);
    test.expect(await getCenterX(thumb)).toBeCloseTo(atLimit, 0);
  });

  test("submits the value and moves the thumb back on a form reset", async ({
    page,
    q,
  }) => {
    const scope = query(q.article("Form"));
    const slider = scope.slider("Brightness");
    const thumb = getThumb(slider);
    const initial = await getCenterX(thumb);
    await slider.focus();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await test.expect(slider).toHaveValue("22");
    await scope.button("Save").click();
    await test.expect(scope.text("Saved 22")).toBeVisible();
    test.expect(await getCenterX(thumb)).toBeGreaterThan(initial);
    await scope.button("Reset").click();
    await test.expect(slider).toHaveValue("20");
    await test.expect.poll(() => getCenterX(thumb)).toBeCloseTo(initial, 0);
  });

  test("moves the thumb back when a form that owns it after render resets", async ({
    page,
    q,
  }) => {
    const scope = query(q.article("Form attribute"));
    const slider = scope.slider("Contrast");
    const thumb = getThumb(slider);
    const initial = await getCenterX(thumb);
    await scope.button("Link the slider").click();
    await test.expect(scope.button("Unlink the slider")).toBeVisible();
    await slider.focus();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await test.expect(slider).toHaveValue("32");
    test.expect(await getCenterX(thumb)).toBeGreaterThan(initial);
    await scope.button("Reset").click();
    await test.expect(slider).toHaveValue("30");
    await test.expect.poll(() => getCenterX(thumb)).toBeCloseTo(initial, 0);
  });

  test("shows the native input in forced colors", async ({ page, q }) => {
    const slider = query(q.article("Default")).slider("Volume");
    const track = slider.locator("xpath=following-sibling::*[1]");
    await test.expect(slider).toHaveCSS("opacity", "0");
    await page.emulateMedia({ forcedColors: "active" });
    await test.expect(slider).toHaveCSS("opacity", "1");
    await test.expect(track).toBeHidden();
  });
});
