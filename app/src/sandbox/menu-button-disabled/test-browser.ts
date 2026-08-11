import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

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

  // https://github.com/ariakit/ariakit/issues/7115
  test("disabled menu button does not open its menu on hover", async ({
    page,
    q,
  }) => {
    await q.button("Hover MenuButton props").hover();
    // These providers use `timeout={0}`, so a menu that opens does so from a
    // store update rendered on the next frames. Cross them to give the absence
    // assertion below a chance to fail.
    await flushFrames(page);
    await test.expect(q.menu("Hover MenuButton props")).not.toBeVisible();

    await q.button("Hover render props").hover();
    // Same store-update frames as above.
    await flushFrames(page);
    await test.expect(q.menu("Hover render props")).not.toBeVisible();

    // The same setup without the disabled props, so the assertions above fail
    // if hovering ever stops opening a menu at all.
    await q.button("Hover enabled").hover();
    await test.expect(q.menu("Hover enabled")).toBeVisible();
  });
});
