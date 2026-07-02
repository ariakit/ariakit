import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
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

    // Tab moves focus into the nested button while Space is still held, so the
    // keyup fires on the button and bubbles through the card. The press never
    // finished on the card, so it must not dispatch a synthetic click on
    // itself, and losing focus must clear the pressed state.
    await page.keyboard.press("Tab");
    await test.expect(q.button("Pin")).toBeFocused();
    await test.expect(card).not.toHaveAttribute("data-active");

    await page.keyboard.up("Space");
    await test.expect(q.status()).toHaveText("card clicks: 0, pins: 0");
    await test.expect(card).not.toHaveAttribute("data-active");
  });
});
