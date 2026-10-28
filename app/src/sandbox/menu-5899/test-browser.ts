import { withFramework } from "#app/test-utils/preview.ts";

const menuButtons = ["Boolean", "Callback"] as const;

withFramework(import.meta.dirname, async ({ test }) => {
  for (const name of menuButtons) {
    // Safari doesn't focus clicked buttons natively and Ariakit does it there,
    // so the click case runs in every engine.
    test(`${name} autoFocusOnShow false does not focus menu on click`, async ({
      q,
    }) => {
      const menuButton = q.button(name);

      await menuButton.click();
      await test.expect(q.menu(name)).toBeVisible();
      await test.expect(menuButton).toBeFocused();
    });
  }
});
