import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("tabs past a popover rendered as a list", async ({ page, q }) => {
    await q.combobox().click();
    const list = q.listbox();
    await test.expect(list).toBeVisible();
    await test.expect(list).toHaveAttribute("tabindex", "-1");

    await page.keyboard.press("Tab");
    await test.expect(q.button("After combobox")).toBeFocused();
  });
});
