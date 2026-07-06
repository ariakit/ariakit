import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // Reproduces https://github.com/ariakit/ariakit/issues/4443
  test("MenuButton aria-haspopup should not change when menu with combobox is opened", async ({
    q,
  }) => {
    const menuButton = q.button("Open menu");

    const initialAriaHasPopup = await menuButton.getAttribute("aria-haspopup");
    test.expect(initialAriaHasPopup).toBe("dialog");

    await menuButton.click();

    await test.expect(q.combobox("Search top-level menu...")).toBeVisible();

    const afterOpenAriaHasPopup =
      await menuButton.getAttribute("aria-haspopup");
    test.expect(afterOpenAriaHasPopup).toBe("dialog");
    test.expect(afterOpenAriaHasPopup).toBe(initialAriaHasPopup);
  });

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
    await test.expect(q.combobox("Search submenu...")).toBeVisible();
  });
});
