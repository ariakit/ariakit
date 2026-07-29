import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/6868
  test("tabs to a non-scrollable list with real focus", async ({ page, q }) => {
    await q.combobox("Real focus fruit").click();
    const input = q.combobox("Search Real focus fruit");
    const list = q.listbox("Real focus fruit");
    await test.expect(input).toBeFocused();

    await page.keyboard.press("Tab");
    await test
      .expect(q.button("Review Real focus fruit options"))
      .toBeFocused();

    await page.keyboard.press("Tab");
    await test.expect(list).toBeFocused();
    await test
      .expect(q.status("Real focus fruit base element"))
      .toHaveText("combobox");

    await page.keyboard.press("ArrowDown");
    await test
      .expect(list.getByRole("option", { name: "Apple" }))
      .toBeFocused();

    await page.keyboard.press("ArrowDown");
    await test
      .expect(list.getByRole("option", { name: "Banana" }))
      .toBeFocused();
  });

  test("tabs to a non-scrollable list with virtual focus", async ({
    page,
    q,
  }) => {
    await q.combobox("Virtual focus fruit").click();
    const input = q.combobox("Search Virtual focus fruit");
    const list = q.listbox("Virtual focus fruit");
    await test.expect(input).toBeFocused();

    await page.keyboard.press("Tab");
    await test
      .expect(q.button("Review Virtual focus fruit options"))
      .toBeFocused();

    await page.keyboard.press("Tab");
    await test.expect(list).toBeFocused();
    await test
      .expect(q.status("Virtual focus fruit base element"))
      .toHaveText("combobox");

    await page.keyboard.press("ArrowDown");
    const apple = list.getByRole("option", { name: "Apple" });
    await test.expect(input).toBeFocused();
    await test.expect(apple).toHaveAttribute("data-focus-visible", "true");

    await page.keyboard.press("ArrowDown");
    const banana = list.getByRole("option", { name: "Banana" });
    await test.expect(input).toBeFocused();
    await test.expect(banana).toHaveAttribute("data-focus-visible", "true");
  });
});
