import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/6347
  test("typeahead skips disabled offscreen select items", async ({
    page,
    q,
  }) => {
    await q.combobox("Fruit").click();
    await test.expect(q.option("Apple")).toHaveAttribute("data-active-item");
    await test.expect(q.option("Papaya")).toHaveAttribute("data-offscreen");

    await page.keyboard.press("p");

    await test
      .expect(q.option("Papaya"))
      .not.toHaveAttribute("data-active-item");
    await test.expect(q.option("Peach")).toHaveAttribute("data-active-item");
  });
});
