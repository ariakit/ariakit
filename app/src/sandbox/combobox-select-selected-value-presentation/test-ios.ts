import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/pull/6832
  test("presents a far selected item with touch real focus", async ({
    page,
    q,
  }) => {
    const select = q.combobox("Touch filterable fruit");
    await select.click();
    await page.keyboard.press("Escape");
    await page.evaluate(() => window.scrollTo({ top: 100 }));
    await test.expect.poll(() => page.evaluate(() => window.scrollY)).toBe(100);

    await select.click();

    await test
      .expect(q.combobox("Search Touch filterable fruit"))
      .toBeFocused();
    await test.expect(q.option("Watermelon")).toBeInViewport();
    test.expect(await page.evaluate(() => window.scrollY)).toBe(100);
  });
});
