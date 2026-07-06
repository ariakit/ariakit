import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/6217
  //
  // A non-native `Command` (rendered as a div) sets a `data-active` ("pressed")
  // state on the Space keydown and clears it on keyup. These tests cover two
  // ways the keyup can be short-circuited, both of which must still clear the
  // state so the element doesn't stay stuck looking pressed.
  test("releasing Space with Meta held clears data-active", async ({
    page,
    q,
  }) => {
    const command = q.text("Meta release");
    await command.focus();

    await page.keyboard.down("Space");
    await test.expect(command).toHaveAttribute("data-active");

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

    await page.keyboard.down("Space");
    await test.expect(command).toHaveAttribute("aria-disabled", "true");
    await test.expect(command).not.toHaveAttribute("data-active");

    await page.keyboard.up("Space");
    await test.expect(command).not.toHaveAttribute("data-active");
  });

  // https://github.com/ariakit/ariakit/issues/6340
  //
  // A non-native `Command` (rendered as a div) sets a `data-active` ("pressed")
  // state on the Space keydown and clears it in its own keyup handler. If focus
  // moves away while Space is still held, the keyup is delivered to the new
  // focus target, so that handler never runs. Native buttons cancel Space
  // activation when they lose focus before the keyup, and the non-native
  // emulation must do the same. These tests cover the two legs of that bug:
  // the element staying stuck looking pressed after focus leaves, and a keyup
  // bubbling from a focused child dispatching a synthetic click on the element
  // even though the press never finished on it.

  test("data-active is cleared when focus leaves while Space is held", async ({
    page,
    q,
  }) => {
    const command = q.text("Save");
    await command.focus();

    // Pressing Space sets the active state on the focused command.
    await page.keyboard.down("Space");
    await test.expect(command).toHaveAttribute("data-active");

    // Clicking elsewhere while Space is still held moves focus away, so the
    // keyup lands on the new focus target (the body) and never reaches the
    // command. Losing focus mid-press must cancel the press, like a native
    // button, instead of leaving the element stuck looking pressed.
    await q.text("Outside text").click();
    await test.expect(command).not.toBeFocused();
    await test.expect(command).not.toHaveAttribute("data-active");

    await page.keyboard.up("Space");
    await test.expect(command).not.toHaveAttribute("data-active");
  });

  test("Space keyup bubbling from a child does not click the command", async ({
    page,
    q,
  }) => {
    // Playwright text queries match the element's full text content (which
    // here includes the nested button's label), so exact matching must be
    // turned off to find the card by its own text.
    const card = q.text("Open article", { exact: false });
    await card.focus();

    // Pressing Space sets the active state on the focused card.
    await page.keyboard.down("Space");
    await test.expect(card).toHaveAttribute("data-active");

    // Move focus into the nested button while Space is still held, so the
    // keyup fires on the button and bubbles through the card. The press never
    // finished on the card, so it must not dispatch a synthetic click on
    // itself, and losing focus must clear the pressed state. The move is
    // scripted rather than pressing Tab because WebKit skips native buttons
    // when tabbing under the default macOS keyboard settings; mid-press focus
    // moves from a script are one of the reported triggers anyway.
    await q.button("Pin").focus();
    await test.expect(q.button("Pin")).toBeFocused();
    await test.expect(card).not.toHaveAttribute("data-active");

    await page.keyboard.up("Space");
    await test.expect(q.status()).toHaveText("card clicks: 0, pins: 0");
    await test.expect(card).not.toHaveAttribute("data-active");
  });

  test("data-active is cleared when a consumer onKeyUp prevents the default", async ({
    page,
    q,
  }) => {
    const command = q.text("Bookmark");
    await command.focus();

    // Pressing Space sets the active state on the focused command.
    await page.keyboard.down("Space");
    await test.expect(command).toHaveAttribute("data-active");

    // The example's own onKeyUp calls preventDefault to suppress the click on
    // release. That must only suppress the click, not skip the state clearing,
    // otherwise the element stays stuck looking pressed.
    await page.keyboard.up("Space");
    await test.expect(command).not.toHaveAttribute("data-active");
  });
});
