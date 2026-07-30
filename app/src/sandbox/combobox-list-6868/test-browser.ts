import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/6868
  test("skips a scrollable list by default", async ({ page, q }) => {
    await q.combobox("Default fruit").click();
    const input = q.combobox("Search Default fruit");
    const list = q.listbox("Default fruit options");
    await test.expect(input).toBeFocused();
    await test.expect(list).toHaveAttribute("tabindex", "-1");
    test
      .expect(await list.evaluate((el) => el.scrollHeight > el.clientHeight))
      .toBe(true);

    await page.keyboard.press("Tab");
    await test.expect(q.button("After Default fruit options")).toBeFocused();

    await list.focus();
    await test.expect(list).toBeFocused();
  });

  // https://github.com/ariakit/ariakit/issues/6868
  test("skips an empty list by default", async ({ page, q }) => {
    await q.combobox("Default fruit").click();
    const input = q.combobox("Search Default fruit");
    const list = q.listbox("Default fruit options");
    await input.fill("zzzz");
    await test.expect(q.status()).toHaveText("No results");
    await test.expect(list).toHaveAttribute("tabindex", "-1");

    await page.keyboard.press("Tab");
    await test.expect(q.button("After Default fruit options")).toBeFocused();
  });

  // https://github.com/ariakit/ariakit/issues/6868
  test("supports opting into the tab order", async ({ page, q }) => {
    await q.combobox("Opt-in fruit").click();
    const input = q.combobox("Search Opt-in fruit");
    const list = q.listbox("Opt-in fruit options");
    await test.expect(input).toBeFocused();
    await test.expect(list).toHaveAttribute("tabindex", "0");

    await page.keyboard.press("Tab");
    await test.expect(list).toBeFocused();
  });
});
