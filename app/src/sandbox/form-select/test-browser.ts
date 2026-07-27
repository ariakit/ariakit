import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("focuses the select through its label without opening it", async ({
    q,
  }) => {
    await q.text("Favorite fruit").click();
    await test.expect(q.combobox("Favorite fruit")).toBeFocused();
    await test
      .expect(q.combobox("Favorite fruit"))
      .toHaveAttribute("data-focus-visible");
    await test.expect(q.listbox()).not.toBeVisible();
  });

  test("shows and hides the select with pointer input", async ({ page, q }) => {
    const select = q.combobox("Favorite fruit");

    await select.click();
    await test.expect(q.listbox()).toBeVisible();
    await test.expect(select).toBeFocused();

    await page.mouse.click(10, 10);
    await test.expect(q.listbox()).not.toBeVisible();
    await test.expect(select).not.toBeFocused();

    await select.click({ delay: 20 });
    await test.expect(q.listbox()).toBeVisible();
    await test.expect(select).toBeFocused();
  });

  test("shows validation only after focus leaves the select widget", async ({
    page,
    q,
  }) => {
    const select = q.combobox("Favorite fruit");
    const errors = q.alert().filter({ hasText: /./ });

    await select.click();
    await test.expect(errors).toHaveCount(0);
    await page.keyboard.press("Escape");
    await test.expect(errors).toHaveCount(0);
    await page.keyboard.press("Space");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await test.expect(errors).toHaveCount(0);
    await page.keyboard.press("Enter");
    await q.option("Select an item").click();
    await test.expect(errors).toHaveCount(0);
    await page.keyboard.press("Tab");
    await test.expect(errors).toHaveCount(1);
  });

  test("focuses the invalid select when submission fails", async ({ q }) => {
    await q.textbox("Name").fill("John");
    await q.button("Submit").click();
    await test.expect(q.alert().filter({ hasText: /./ })).toHaveCount(1);
    await test.expect(q.combobox("Favorite fruit")).toBeFocused();
    await test.expect(q.listbox()).not.toBeVisible();
  });

  test("submits and resets a valid selection", async ({ page, q }) => {
    await q.textbox("Name").fill("John");
    await q.combobox("Favorite fruit").click();
    await q.option("Banana").click();

    await Promise.all([
      page.waitForEvent("dialog").then(async (dialog) => {
        test
          .expect(dialog.message())
          .toBe(JSON.stringify({ name: "John", fruit: "Banana" }));
        await dialog.accept();
      }),
      q.button("Submit").click(),
    ]);

    await test
      .expect(q.combobox("Favorite fruit"))
      .toHaveText("Select an item");
  });
});
