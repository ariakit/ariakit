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
    await test.expect(list).not.toBeFocused();
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

  // https://github.com/ariakit/ariakit/pull/6968#discussion_r3682117297
  test("ignores an authored tabIndex", async ({ page, q }) => {
    await q.combobox("Authored tab index fruit").click();
    const input = q.combobox("Search Authored tab index fruit");
    const list = q.listbox("Authored tab index fruit options");
    await test.expect(input).toBeFocused();

    await page.keyboard.press("Tab");
    await test
      .expect(q.button("After Authored tab index fruit options"))
      .toBeFocused();
    await test.expect(list).toHaveAttribute("tabindex", "-1");
  });

  test("moves focus from a standalone list to the combobox", async ({ q }) => {
    const combobox = q.combobox("Standalone fruit");
    const list = q.listbox("Standalone fruit options");

    await list.click();
    await test.expect(combobox).toBeFocused();
  });
});
