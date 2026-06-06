import { withFramework } from "#app/test-utils/preview.ts";

// See https://github.com/ariakit/ariakit/issues/6217
//
// Only the Meta-held release case is covered here. The companion "disable on
// press" case can't be reproduced through real keyboard interaction in a
// browser: once the command disables itself on keydown it stops being focusable
// and the browser blurs it to the body, so the genuine keyup never reaches the
// element. That case relies on dispatching the keyup directly on the element and
// stays covered by the happy-dom `test.ts`.
withFramework(import.meta.dirname, async ({ test }) => {
  test("releasing Space with Meta held clears data-active", async ({
    page,
    q,
  }) => {
    const command = q.text("Meta release");
    await command.focus();
    await test.expect(command).toBeFocused();

    // Pressing Space sets the active ("pressed") state on a non-native command
    // via onKeyDown.
    await page.keyboard.down("Space");
    await test.expect(command).toHaveAttribute("data-active");

    // Releasing Space while Meta is held short-circuits onKeyUp's `metaKey`
    // guard. Releasing the key should always clear the active state, otherwise
    // the element stays stuck in a visually "pressed" state.
    await page.keyboard.down("Meta");
    await page.keyboard.up("Space");
    await test.expect(command).not.toHaveAttribute("data-active");
    await page.keyboard.up("Meta");
  });
});
