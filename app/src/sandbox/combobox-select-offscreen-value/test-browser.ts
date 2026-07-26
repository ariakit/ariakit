import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("keeps value-less offscreen items offscreen with no selected value", async ({
    q,
  }) => {
    await q.combobox("Fruit").click();

    await test.expect(q.option("No fruit")).toHaveAttribute("data-offscreen");
  });

  test("mounts the offscreen item matching the selected value", async ({
    q,
  }) => {
    await q.combobox("Selected fruit").click();

    await test.expect(q.option("Apple")).not.toHaveAttribute("data-offscreen");
    await test
      .expect(q.option("No selected fruit"))
      .toHaveAttribute("data-offscreen");
  });

  // https://github.com/ariakit/ariakit/pull/6832
  test("focuses an item that renders after typeahead movement", async ({
    page,
    q,
  }) => {
    const select = q.combobox("Selected fruit");
    await select.click();
    await page.keyboard.type("ly");

    const lychee = q.option("Lychee");
    await test.expect(lychee).toHaveAttribute("data-active-item");
    await test.expect(lychee).toBeInViewport();
    await test.expect(select).toBeFocused();
  });

  test("reopening presents a far selected item", async ({ page, q }) => {
    const select = q.combobox("Single selected fruit");
    await select.click();
    await test.expect(q.option("Apple")).toHaveAttribute("data-active-item");

    const watermelon = q.option("Watermelon");
    await page.keyboard.press("w");
    await test.expect(watermelon).toHaveAttribute("data-active-item");
    await page.keyboard.press("Enter");
    await test.expect(select).toHaveText("Watermelon");
    await test.expect(q.listbox()).not.toBeVisible();
    await select.click();

    await test.expect(watermelon).toHaveAttribute("data-active-item");
    await test.expect(watermelon).toBeInViewport();
    await test.expect(select).toBeFocused();
  });

  // https://github.com/ariakit/ariakit/pull/6832
  test("presents a far selected item with real focus", async ({ page, q }) => {
    const select = q.combobox("Filterable fruit");
    await select.click();
    await page.keyboard.press("Escape");
    await page.evaluate(() => window.scrollTo({ top: 100 }));
    await test.expect.poll(() => page.evaluate(() => window.scrollY)).toBe(100);

    await select.click();

    await test.expect(q.combobox("Search Filterable fruit")).toBeFocused();
    await test.expect(q.option("Watermelon")).toBeInViewport();
    test.expect(await page.evaluate(() => window.scrollY)).toBe(100);
  });

  // https://github.com/ariakit/ariakit/pull/6832
  test("cancels presentation when real focus moves", async ({ page, q }) => {
    await q.combobox("Focus moving filterable fruit").click();

    await test.expect(q.option("Focus target")).toBeFocused();
    await page.evaluate(
      () =>
        new Promise((resolve) => {
          requestAnimationFrame(() => requestAnimationFrame(resolve));
        }),
    );
    await test.expect(q.option("Focus target")).toBeInViewport();
    await test.expect(q.option("Watermelon")).not.toBeInViewport();
  });
});
