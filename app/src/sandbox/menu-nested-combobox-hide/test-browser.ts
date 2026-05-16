import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("clicking submenu button with combobox should not close parent menu", async ({
    q,
  }) => {
    const menuButton = q.button("Actions");
    await menuButton.click();
    await test.expect(q.menuitem("Cut")).toBeVisible();

    // The "Search items" submenu button has aria-haspopup="dialog" because its
    // menu contains a combobox. Clicking it should NOT close the parent menu.
    const submenuButton = q.menuitem("Search items");
    await test.expect(submenuButton).toHaveAttribute("aria-haspopup", "dialog");
    await submenuButton.click();

    // The parent menu should remain open.
    await test.expect(q.menuitem("Cut")).toBeVisible();
    // The submenu should be open.
    await test.expect(q.combobox("Search...")).toBeVisible();
  });
});
