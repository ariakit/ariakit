import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/pull/6832#discussion_r3647555720
  test("keeps a disabled filterable select out of the tab order", async ({
    page,
    q,
  }) => {
    const select = q.combobox("Disabled fruit");
    await test.expect(select).toBeDisabled();

    await q.textbox("Before disabled select").focus();
    await page.keyboard.press("Tab");

    await test.expect(q.textbox("After disabled select")).toBeFocused();
  });
});
