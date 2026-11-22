import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("keeps the copy button at the top of the code when the page scrolls", async ({
    page,
    q,
  }) => {
    // The wrapped code is taller than this screen, so the page scrolls past the
    // top of the code.
    await page.setViewportSize({ width: 700, height: 250 });
    const code = page.locator("pre");
    const button = q.button("Copy package.json");
    const getOffset = async () => {
      const codeBox = await code.boundingBox();
      const buttonBox = await button.boundingBox();
      if (!codeBox || !buttonBox) throw new Error("Missing box");
      return Math.round(buttonBox.y - codeBox.y);
    };
    const offset = await getOffset();
    await page.evaluate(() => window.scrollTo(0, 200));
    test.expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
    test.expect(await getOffset()).toBe(offset);
  });
});
