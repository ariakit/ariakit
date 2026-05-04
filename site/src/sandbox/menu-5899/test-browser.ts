import { withFramework } from "#app/test-utils/preview.ts";

const menuButtons = ["Boolean", "Callback"] as const;

withFramework(import.meta.dirname, async ({ test }) => {
  test("preserves menu button focus when autoFocusOnShow is false or returns false", async ({
    page,
    q,
  }) => {
    for (const menuButtonName of menuButtons) {
      const menuButton = q.button(menuButtonName);

      await menuButton.click();

      await test.expect(q.menu(menuButtonName)).toBeVisible();
      await test.expect(menuButton).toBeFocused();

      await page.keyboard.press("ArrowDown");
      await test.expect(q.menuitem("Edit")).toBeFocused();

      await page.keyboard.press("Escape");
      await test.expect(q.menu(menuButtonName)).not.toBeVisible();
      await test.expect(menuButton).toBeFocused();
    }
  });

  test("focuses menu items on arrow key show when autoFocusOnShow is false or returns false", async ({
    page,
    q,
  }) => {
    for (const menuButtonName of menuButtons) {
      const menuButton = q.button(menuButtonName);

      await menuButton.focus();
      await page.keyboard.press("ArrowDown");
      await test.expect(q.menuitem("Edit")).toBeFocused();

      await page.keyboard.press("Escape");
      await test.expect(q.menu(menuButtonName)).not.toBeVisible();
      await test.expect(menuButton).toBeFocused();
    }
  });

  test("focuses menu items on keyboard click when autoFocusOnShow is false or returns false", async ({
    page,
    q,
  }) => {
    for (const menuButtonName of menuButtons) {
      const menuButton = q.button(menuButtonName);

      await menuButton.focus();
      await page.keyboard.press("Enter");
      await test.expect(q.menuitem("Edit")).toBeFocused();

      await page.keyboard.press("Escape");
      await test.expect(q.menu(menuButtonName)).not.toBeVisible();
      await test.expect(menuButton).toBeFocused();
    }
  });

  test("preserves menu-specific auto focus guard for callback true", async ({
    q,
  }) => {
    const toggleButton = q.button("Toggle Callback True");
    const menu = q.menu("Callback True");

    await toggleButton.click();

    await test.expect(menu).toBeVisible();
    await test.expect(toggleButton).toBeFocused();

    await toggleButton.click();

    await test.expect(menu).not.toBeVisible();
    await test.expect(toggleButton).toBeFocused();
  });
});
