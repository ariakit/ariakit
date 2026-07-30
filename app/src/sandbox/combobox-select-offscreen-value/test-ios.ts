import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/pull/6832
  // https://github.com/ariakit/ariakit/issues/6838
  test("centers a far selected item with touch real focus", async ({
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
    await flushFrames(page, 3);
    const watermelon = q.option("Watermelon");
    await test.expect(watermelon).toBeInViewport();
    const centerOffset = await watermelon.evaluate((element) => {
      const listbox = element.closest("[role=listbox]");
      if (!listbox) return Infinity;
      const listboxRect = listbox.getBoundingClientRect();
      const itemRect = element.getBoundingClientRect();
      const listboxCenter = listboxRect.top + listboxRect.height / 2;
      const itemCenter = itemRect.top + itemRect.height / 2;
      return itemCenter - listboxCenter;
    });
    test.expect(Math.abs(centerOffset)).toBeLessThanOrEqual(1);
    test.expect(await page.evaluate(() => window.scrollY)).toBe(100);
  });
});
