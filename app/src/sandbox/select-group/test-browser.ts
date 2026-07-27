import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // examples/select-group/test.ts
  test("clears the active option when hovering a group label", async ({
    page,
    q,
  }) => {
    const select = q.combobox("Favorite food");
    await select.click();
    await q.option("Banana").hover();
    await test.expect(q.option("Banana")).toHaveAttribute("data-active-item");

    await q.text("Dairy").hover();
    await test.expect(select).not.toHaveAttribute("aria-activedescendant");
    await page.keyboard.press("ArrowDown");
    await test.expect(q.option("Apple")).toHaveAttribute("data-active-item");
  });

  // examples/select-group/test-browser.ts
  test("restores a far selected option without scrolling the page", async ({
    page,
    q,
  }) => {
    const select = q.combobox("Favorite food");
    await select.click();
    await page.keyboard.type("cc");
    await test.expect(q.option("Chips")).toBeInViewport();
    await page.keyboard.press("Enter");
    await page.evaluate(() => window.scrollTo({ top: 100 }));

    await select.click();
    await test.expect(q.option("Chips")).toBeInViewport();
    test.expect(await page.evaluate(() => window.scrollY)).toBe(100);
  });
});
