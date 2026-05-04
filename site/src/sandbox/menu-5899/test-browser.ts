import { withFramework } from "#app/test-utils/preview.ts";

const menuButtons = ["Boolean", "Callback"] as const;
const openKeys = ["Enter", "Space", "ArrowDown", "ArrowUp"] as const;

withFramework(import.meta.dirname, async ({ test }) => {
  for (const name of menuButtons) {
    test(`${name} autoFocusOnShow false does not focus menu on open`, async ({
      page,
      q,
    }) => {
      const menuButton = q.button(name);

      await menuButton.click();
      await test.expect(q.menu(name)).toBeVisible();
      await test.expect(menuButton).toBeFocused();

      await page.keyboard.press("Escape");
      await test.expect(q.menu(name)).not.toBeVisible();

      for (const key of openKeys) {
        await menuButton.focus();
        await page.keyboard.press(key);

        await test.expect(q.menu(name)).toBeVisible();
        await test.expect(menuButton).toBeFocused();

        await page.keyboard.press("Escape");
        await test.expect(q.menu(name)).not.toBeVisible();
      }
    });

    test(`${name} menu accepts arrow focus after it is open`, async ({
      page,
      q,
    }) => {
      const menuButton = q.button(name);

      await menuButton.focus();
      await page.keyboard.press("ArrowDown");
      await test.expect(q.menu(name)).toBeVisible();
      await test.expect(menuButton).toBeFocused();

      await page.keyboard.press("ArrowDown");
      await test.expect(q.menuitem("Edit")).toBeFocused();

      await page.keyboard.press("Escape");
      await test.expect(q.menu(name)).not.toBeVisible();

      await page.keyboard.press("ArrowUp");
      await test.expect(q.menu(name)).toBeVisible();
      await test.expect(menuButton).toBeFocused();

      await page.keyboard.press("ArrowUp");
      await test.expect(q.menuitem("Report")).toBeFocused();
    });
  }
});
