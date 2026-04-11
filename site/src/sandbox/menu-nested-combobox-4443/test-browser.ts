import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("MenuButton aria-haspopup should not change when menu with combobox is opened", async ({
    page,
    q,
  }) => {
    const menuButton = q.button("Open menu");

    // Get initial aria-haspopup value
    const initialAriaHaspopup = await menuButton.getAttribute("aria-haspopup");

    // Open the menu
    await menuButton.click();

    // Wait for the combobox to be visible (indicates menu is open)
    await test.expect(q.combobox("Search...")).toBeVisible();

    // Get aria-haspopup after opening
    const afterOpenAriaHaspopup =
      await menuButton.getAttribute("aria-haspopup");

    // The aria-haspopup value should not change when the menu opens.
    // Currently this fails: it changes from "menu" to "dialog" because
    // getPopupRole dynamically reads the content element's role.
    test.expect(afterOpenAriaHaspopup).toBe(initialAriaHaspopup);
  });
});
