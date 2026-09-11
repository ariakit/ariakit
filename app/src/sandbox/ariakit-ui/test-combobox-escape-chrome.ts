import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, { route: "combobox" }, async ({ test }) => {
  // The lists held open on this route mark every list that already exists when
  // they open as outside them, and Ariakit then ignores Escape on it. The lists
  // that tests open render in a portal and mount on open to avoid the marks,
  // and these tests guard that they still close on Escape.
  // https://github.com/ariakit/ariakit/issues/7463
  test("closes the live combobox list on Escape", async ({ page, q }) => {
    const input = q.combobox("Destination");
    await input.click();
    const list = q.listbox("Destination");
    await test.expect(list).toBeVisible();
    await page.keyboard.press("Escape");
    await test.expect(list).toBeHidden();
    await test.expect(input).toBeFocused();
  });

  // https://github.com/ariakit/ariakit/issues/7463
  test("closes the live select lists on Escape", async ({ page, q }) => {
    for (const name of ["Favorite fruit", "Review status"]) {
      const select = q.combobox(name);
      await select.click();
      const list = q.listbox(name);
      await test.expect(list).toBeVisible();
      await page.keyboard.press("Escape");
      await test.expect(list).toBeHidden();
      await test.expect(select).toBeFocused();
    }
  });
});
