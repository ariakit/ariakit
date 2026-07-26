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
    await page.keyboard.type("water");
    await page.keyboard.press("Enter");
    await select.click();

    const watermelon = q.option("Watermelon");
    await test.expect(watermelon).toHaveAttribute("data-active-item");
    await test.expect(watermelon).toBeInViewport();
    await test.expect(select).toBeFocused();
  });
});
