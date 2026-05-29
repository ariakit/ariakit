import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("MenuButton aria-haspopup should not change when menu with combobox is opened", async ({
    q,
  }) => {
    const menuButton = q.button("Open menu");

    // Get initial aria-haspopup value - should be "dialog" since menu has combobox
    const initialAriaHasPopup = await menuButton.getAttribute("aria-haspopup");
    test.expect(initialAriaHasPopup).toBe("dialog");

    // Open the menu
    await menuButton.click();

    // Wait for the combobox to be visible (indicates menu is open)
    await test.expect(q.combobox("Search...")).toBeVisible();

    // Get aria-haspopup after opening - should remain "dialog"
    const afterOpenAriaHasPopup =
      await menuButton.getAttribute("aria-haspopup");
    test.expect(afterOpenAriaHasPopup).toBe("dialog");

    // Verify stability: value should not change when menu opens
    test.expect(afterOpenAriaHasPopup).toBe(initialAriaHasPopup);
  });
});
