import { AxeBuilder } from "@axe-core/playwright";
import { withFramework } from "#app/test-utils/preview.ts";

const LAYER_BUTTONS = [
  "Neutral",
  "Surface",
  "Contrast",
  "Inverted",
  "Blue",
  "Red",
  "Green",
  "Yellow",
  "Purple",
  "Orange",
  "Black",
  "White",
];

const NESTED_BUTTONS = ["Nested blue", "Nested inverted", "Nested red"];

withFramework(import.meta.dirname, async ({ test }) => {
  test("layer buttons are visible", async ({ q }) => {
    for (const name of LAYER_BUTTONS) {
      await test.expect(q.button(name, { exact: true })).toBeVisible();
    }
  });

  test("nested frame buttons are visible", async ({ q }) => {
    for (const name of NESTED_BUTTONS) {
      await test.expect(q.button(name)).toBeVisible();
    }
  });

  test("no color contrast violations (WCAG AA)", async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withRules(["color-contrast"])
      .analyze();
    test.expect(results.violations).toEqual([]);
  });

  // Verifies the adaptive text direction: a black background should flip text
  // to light, and a white background should flip text to dark.
  test("black layer produces light text", async ({ page }) => {
    const isLight = await page.evaluate(() => {
      const button = Array.from(document.querySelectorAll("button")).find(
        (b) => b.textContent?.trim() === "Black",
      );
      if (!button) throw new Error("Black button not found");
      const canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = window.getComputedStyle(button).color;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
      return ((r ?? 0) + (g ?? 0) + (b ?? 0)) / 3 > 128;
    });
    test
      .expect(isLight, "Black background should produce light text")
      .toBe(true);
  });

  test("white layer produces dark text", async ({ page }) => {
    const isDark = await page.evaluate(() => {
      const button = Array.from(document.querySelectorAll("button")).find(
        (b) => b.textContent?.trim() === "White",
      );
      if (!button) throw new Error("White button not found");
      const canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = window.getComputedStyle(button).color;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
      return ((r ?? 0) + (g ?? 0) + (b ?? 0)) / 3 < 128;
    });
    test.expect(isDark, "White background should produce dark text").toBe(true);
  });
});
