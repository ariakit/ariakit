import { withFramework } from "#app/test-utils/preview.ts";

const menuButtons = ["Boolean", "Callback"] as const;
const openKeys = ["Enter", "Space", "ArrowDown", "ArrowUp"] as const;

withFramework(import.meta.dirname, async ({ test }) => {
  for (const name of menuButtons) {
    test(`${name} autoFocusOnShow false does not focus menu on click`, async ({
      q,
    }) => {
      const menuButton = q.button(name);

      await menuButton.click();
      await test.expect(q.menu(name)).toBeVisible();
      await test.expect(menuButton).toBeFocused();
    });

    for (const key of openKeys) {
      test(`${name} autoFocusOnShow false does not focus menu on ${key}`, async ({
        page,
        q,
      }) => {
        const menuButton = q.button(name);

        await menuButton.focus();
        await page.keyboard.press(key);

        await test.expect(q.menu(name)).toBeVisible();
        await test.expect(menuButton).toBeFocused();
      });
    }

    test(`${name} menu accepts ArrowDown focus after it is open`, async ({
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
    });

    if (name === "Callback") {
      test(`${name} autoFocusOnShow false calls the callback`, async ({
        page,
        q,
      }) => {
        const menuButton = q.button(name);

        await menuButton.focus();
        await page.keyboard.press("ArrowDown");

        await test
          .expect(q.menuitem("Edit"))
          .toHaveAttribute("data-autofocus-on-show-callback", "true");
        await test.expect(menuButton).toBeFocused();
      });
    }

    test(`${name} menu accepts ArrowUp focus after it is open`, async ({
      page,
      q,
    }) => {
      const menuButton = q.button(name);

      await menuButton.focus();
      await page.keyboard.press("ArrowUp");
      await test.expect(q.menu(name)).toBeVisible();
      await test.expect(menuButton).toBeFocused();

      await page.keyboard.press("ArrowUp");
      await test.expect(q.menuitem("Report")).toBeFocused();
    });
  }
});
