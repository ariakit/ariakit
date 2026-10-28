import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/4133
  test("disabled menu button with render remains accessible", async ({
    page,
    q,
  }) => {
    const menuButton = q.button("MenuButton props");

    await test.expect(menuButton).toHaveAttribute("aria-disabled", "true");
    await test.expect(menuButton).not.toHaveAttribute("disabled");

    await menuButton.focus();
    await test.expect(menuButton).toBeFocused();

    await page.keyboard.press("ArrowDown");
    await test.expect(q.menu("MenuButton props")).not.toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/4133
  test("disabled rendered button does not open menu with arrow keys", async ({
    page,
    q,
  }) => {
    const menuButton = q.button("Render props");

    await test.expect(menuButton).toHaveAttribute("aria-disabled", "true");
    await test.expect(menuButton).not.toHaveAttribute("disabled");

    await menuButton.focus();
    await test.expect(menuButton).toBeFocused();

    await page.keyboard.press("ArrowDown");
    await test.expect(q.menu("Render props")).not.toBeVisible();
  });
});
