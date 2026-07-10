import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("preserves contrast bias without quantized parent lightness", async ({
    page,
    q,
  }) => {
    await page.emulateMedia({ contrast: "more" });

    const control = q.region("Layer without contrast");
    const contrast = q.region("Layer with unmatched contrast");
    const getBackgroundColor = (element: HTMLElement) =>
      getComputedStyle(element).backgroundColor;

    await expect(contrast).toHaveCSS("--_ak-lcd", "0");
    expect(await contrast.evaluate(getBackgroundColor)).toBe(
      await control.evaluate(getBackgroundColor),
    );
    expect(
      await q
        .region("Pushed layer with unmatched contrast")
        .evaluate(getBackgroundColor),
    ).toBe(
      await q
        .region("Pushed layer without contrast")
        .evaluate(getBackgroundColor),
    );
  });

  test("does not inherit contrast direction into nested pushed layers", async ({
    page,
    q,
  }) => {
    await page.emulateMedia({ contrast: "more" });

    const contrastParent = q.region("Matched contrast parent");
    const control = q.region("Nested pushed layer control");
    const nested = q.region("Nested pushed layer under contrast");
    const getCustomProperty = (element: HTMLElement) =>
      getComputedStyle(element).getPropertyValue("--_ak-lcd").trim();
    const getBackgroundColor = (element: HTMLElement) =>
      getComputedStyle(element).backgroundColor;

    expect(await contrastParent.evaluate(getCustomProperty)).not.toBe("0");
    await expect(nested).toHaveCSS("--_ak-lcd", "0");
    expect(await nested.evaluate(getBackgroundColor)).toBe(
      await control.evaluate(getBackgroundColor),
    );
  });
});
