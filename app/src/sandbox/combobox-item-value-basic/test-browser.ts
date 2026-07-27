import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("marks user and autocomplete text in each item value", async ({
    page,
    q,
  }) => {
    const combobox = q.combobox();
    await combobox.focus();
    await page.keyboard.type("a");
    await page.keyboard.press("ArrowDown");

    const apple = q.option("Apple");
    await test.expect(apple).toHaveAttribute("data-active-item");
    await test.expect(apple.locator("[data-user-value]")).toHaveText(["A"]);
    await test
      .expect(apple.locator("[data-autocomplete-value]"))
      .toHaveText(["pple"]);

    await page.keyboard.press("Enter");
    await test.expect(combobox).toHaveValue("Apple");
  });

  test("marks repeated user text separately", async ({ page, q }) => {
    const combobox = q.combobox();
    await combobox.focus();
    await page.keyboard.type("p");
    await page.keyboard.press("ArrowDown");

    const apple = q.option("Apple");
    await test
      .expect(apple.locator("[data-user-value]"))
      .toHaveText(["p", "p"]);
    await test
      .expect(apple.locator("[data-autocomplete-value]"))
      .toHaveText(["A", "le"]);
  });
});
