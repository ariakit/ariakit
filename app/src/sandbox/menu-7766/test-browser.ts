import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // The focused item can become disabled. Browsers differ in when a disabled
  // element loses focus: it can still have it when the menu checks where the
  // user is. The user cannot stay on that item, so the menu takes its initial
  // focus again on the first enabled item.
  // https://github.com/ariakit/ariakit/issues/7766
  test("moves focus to the first enabled item when the focused item of an open menu becomes disabled", async ({
    page,
    q,
  }) => {
    await q.button("Edit with disabled Undo").focus();
    await page.keyboard.press("Enter");
    await test.expect(q.menuitem("Cut")).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await test.expect(q.menuitem("Undo")).toBeEnabled();
    await page.keyboard.press("Home");
    await test.expect(q.menuitem("Undo")).toBeFocused();

    // Undo uses up the history, so it becomes disabled.
    await page.keyboard.press("Enter");
    await test.expect(q.menuitem("Undo")).toBeDisabled();
    await test.expect(q.menuitem("Cut")).toBeFocused();
  });
});
