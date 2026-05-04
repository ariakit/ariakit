import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("preserves menu button focus when autoFocusOnShow is false", async ({
    page,
    q,
  }) => {
    const menuButton = q.button("Actions");

    await menuButton.click();

    await test.expect(q.menu()).toBeVisible();
    await test.expect(menuButton).toBeFocused();

    await page.keyboard.press("ArrowDown");
    await test.expect(q.menuitem("Edit")).toBeFocused();

    await page.keyboard.press("Escape");
    await test.expect(q.menu()).not.toBeVisible();
    await test.expect(menuButton).toBeFocused();
  });

  test("focuses menu items on arrow key show when autoFocusOnShow is false", async ({
    page,
    q,
  }) => {
    const menuButton = q.button("Actions");

    await menuButton.focus();
    await page.keyboard.press("ArrowDown");
    await test.expect(q.menuitem("Edit")).toBeFocused();

    await page.keyboard.press("Escape");
    await test.expect(q.menu()).not.toBeVisible();
    await test.expect(menuButton).toBeFocused();
  });

  test("focuses menu items on keyboard click when autoFocusOnShow is false", async ({
    page,
    q,
  }) => {
    const menuButton = q.button("Actions");

    await menuButton.focus();
    await page.keyboard.press("Enter");
    await test.expect(q.menuitem("Edit")).toBeFocused();
  });
});
