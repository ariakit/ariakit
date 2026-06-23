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

  test("typeahead includes accessible disabled offscreen select items", async ({
    page,
    q,
  }) => {
    await q.combobox("Accessible fruit").click();
    await test.expect(q.option("Pawpaw")).toHaveAttribute("data-offscreen");
    await test
      .expect(q.option("Pawpaw"))
      .toHaveAttribute("aria-disabled", "true");

    await page.keyboard.press("p");

    await test.expect(q.option("Pawpaw")).toHaveAttribute("data-active-item");
  });

  test("typeahead skips aria-disabled offscreen select items", async ({
    page,
    q,
  }) => {
    await q.combobox("ARIA disabled fruit").click();
    await test.expect(q.option("Papaw")).toHaveAttribute("data-offscreen");
    await test
      .expect(q.option("Papaw"))
      .toHaveAttribute("aria-disabled", "true");

    await page.keyboard.press("p");

    await test
      .expect(q.option("Papaw"))
      .not.toHaveAttribute("data-active-item");
    await test.expect(q.option("Peach")).toHaveAttribute("data-active-item");
  });
});
