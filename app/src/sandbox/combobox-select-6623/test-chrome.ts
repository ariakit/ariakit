import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/6623
  test("redirects focus to the select when an option is focused on mount", async ({
    q,
  }) => {
    const select = q.combobox("Favorite fruit");
    await select.click();
    await test.expect(q.listbox()).toBeVisible();
    await test.expect(select).toBeFocused();
    await test.expect(q.option("Banana")).toHaveAttribute("data-active-item");
  });
});
