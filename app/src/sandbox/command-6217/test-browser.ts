import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/6217
  //
  // A non-native `Command` (rendered as a div) sets a `data-active` ("pressed")
  // state on the Space keydown and clears it on keyup. These tests cover two ways
  // the keyup can be short-circuited, both of which must still clear the state so
  // the element doesn't stay stuck looking pressed.

  test("releasing Space with Meta held clears data-active", async ({
    page,
    q,
  }) => {
    const command = q.text("Meta release");
    await command.focus();

    // Pressing Space sets the active state on the focused command.
    await page.keyboard.down("Space");
    await test.expect(command).toHaveAttribute("data-active");

    // Releasing Space while Meta is held short-circuits onKeyUp's `metaKey`
    // guard. Focus stays on the command, so the keyup reaches it and must clear
    // the active state.
    await page.keyboard.down("Meta");
    await page.keyboard.up("Space");
    await page.keyboard.up("Meta");
    await test.expect(command).not.toHaveAttribute("data-active");
  });

  test("releasing Space clears data-active when the element becomes disabled mid-press", async ({
    page,
    q,
  }) => {
    const command = q.text("Disable on press");
    await command.focus();

    // Pressing Space sets the active state and disables the element (the example
    // flips `disabled` in its own keydown handler). A non-native element that
    // becomes disabled loses focusability, so the browser blurs it to the body —
    // the keyup then lands on the body and never reaches the command. The active
    // state must still be cleared so the element doesn't stay stuck pressed.
    await page.keyboard.down("Space");
    await test.expect(command).toHaveAttribute("aria-disabled", "true");
    // The active state must clear as soon as the element becomes disabled — it
    // can't rely on the keyup, which in a real browser lands on the body once the
    // disabled element loses focus. (We don't assert the blur itself: the focus
    // fixup for a div whose tabindex is removed isn't portable across browsers.)
    await test.expect(command).not.toHaveAttribute("data-active");

    await page.keyboard.up("Space");
    await test.expect(command).not.toHaveAttribute("data-active");
  });
});
