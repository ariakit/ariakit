import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("scrolls long lines with the keyboard", async ({ page, q }) => {
    // A narrow viewport makes the longest line overflow the block.
    await page.setViewportSize({ width: 320, height: 600 });
    const code = q.region("Counter component");
    await test.expect
      .poll(() =>
        code.evaluate((element) => element.scrollWidth > element.clientWidth),
      )
      .toBe(true);
    // The code is the first tab stop of the page.
    await page.keyboard.press("Tab");
    await test.expect(code).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await test.expect
      .poll(() => code.evaluate((element) => element.scrollLeft))
      .toBeGreaterThan(0);
  });
});
