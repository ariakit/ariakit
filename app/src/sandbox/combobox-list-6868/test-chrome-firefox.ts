import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/6868
  test("does not leave focus on the scrollable list after Tab", async ({
    page,
    q,
  }) => {
    await q.combobox("Favorite fruit").click();
    const input = q.combobox("Search fruits");
    const list = q.listbox("Favorite fruit");
    await test.expect(input).toBeFocused();
    test
      .expect(await list.evaluate((element) => element.scrollHeight))
      .toBe(await list.evaluate((element) => element.clientHeight * 3));

    await page.keyboard.press("Tab");

    await test.expect(list).not.toBeFocused();
  });
});
