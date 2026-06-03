import { gotoAndSettle, withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test.setTimeout(60_000);

  test("SelectRenderer forwards horizontal orientation to item layout", async ({
    page,
    q,
  }) => {
    const select = q.combobox("Favorite fruit");
    await test
      .expect(async () => {
        if ((await select.count()) === 0) {
          await gotoAndSettle(page, page.url());
        }
        await test.expect(select).toBeVisible({ timeout: 5_000 });
      })
      .toPass({ timeout: 45_000 });

    await select.click();
    await test.expect(q.option("Apple")).toBeVisible();
    await test.expect(q.option("Banana")).toBeVisible();
    const optionCount = await q.option().count();

    const getRect = (name: string) =>
      q.option(name).evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return {
          left: rect.left,
          top: rect.top,
          width: rect.width,
        };
      });

    const apple = await getRect("Apple");
    const banana = await getRect("Banana");
    const rendererWidth = await page
      .locator("#fruit-renderer")
      .evaluate((element) => element.getBoundingClientRect().width);

    test.expect(banana.left).toBeGreaterThan(apple.left);
    test
      .expect(Math.abs(banana.left - apple.left - apple.width))
      .toBeLessThan(1);
    test.expect(Math.abs(banana.top - apple.top)).toBeLessThan(1);
    test
      .expect(Math.abs(rendererWidth - apple.width * optionCount))
      .toBeLessThan(1);
  });
});
