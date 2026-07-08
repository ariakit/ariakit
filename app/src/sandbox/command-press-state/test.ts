import { click, focus, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

// See https://github.com/ariakit/ariakit/issues/6217
test("releasing Space with Meta held clears data-active", async () => {
  const command = q.text("Meta release");
  await focus(command);
  expect(command).toHaveFocus();

  await press.down.Space();
  expect(command).toHaveAttribute("data-active");

  await press.up.Space(null, { metaKey: true });
  expect(command).not.toHaveAttribute("data-active");
});

test("releasing Space clears data-active when the element becomes disabled mid-press", async () => {
  const command = q.text("Disable on press");
  await focus(command);
  expect(command).toHaveFocus();

  await press.down.Space();
  expect(command).toHaveAttribute("aria-disabled", "true");
  expect(command).not.toHaveAttribute("data-active");

  // In a real browser the disabled element has blurred to the body, so the
  // keyup never reaches the command. happy-dom does not blur the disabled
  // element; `test-browser.ts` covers the real blur-to-body keyup routing.
  await press.up.Space();
  expect(command).not.toHaveAttribute("data-active");
});

// See https://github.com/ariakit/ariakit/issues/6340
test("data-active is cleared when focus leaves while Space is held", async () => {
  const command = q.text("Save");
  await focus(command);
  expect(command).toHaveFocus();

  // Pressing Space sets the active ("pressed") state on a non-native command.
  await press.down.Space();
  expect(command).toHaveAttribute("data-active");

  // Clicking elsewhere while Space is still held moves focus to the body, so
  // the keyup lands there and never reaches the command. Losing focus
  // mid-press must cancel the press, like a native button, instead of leaving
  // the element stuck looking pressed.
  await click(q.text("Outside text"));
  expect(command).not.toHaveFocus();
  expect(command).not.toHaveAttribute("data-active");

  await press.up.Space();
  expect(command).not.toHaveAttribute("data-active");
});

test("Space keyup bubbling from a child does not click the command", async () => {
  const card = q.text("Open article");
  await focus(card);
  expect(card).toHaveFocus();

  // Pressing Space sets the active state on the focused card.
  await press.down.Space();
  expect(card).toHaveAttribute("data-active");

  // Tab moves focus into the nested button while Space is still held, so the
  // keyup fires on the button and bubbles through the card. The press never
  // finished on the card, so it must not dispatch a synthetic click on itself,
  // and losing focus must clear the pressed state.
  await press.Tab();
  expect(q.button("Pin")).toHaveFocus();
  expect(card).not.toHaveAttribute("data-active");

  await press.up.Space();
  // Unlike a real browser, the `press.up` emulation synthesizes a click on any
  // focused native button regardless of where the keydown happened, so the pin
  // count is asserted only in `test-browser.ts`.
  expect(q.status()).toHaveTextContent("card clicks: 0");
  expect(card).not.toHaveAttribute("data-active");
});

test("data-active is cleared when a consumer onKeyUp prevents the default", async () => {
  const command = q.text("Bookmark");
  await focus(command);
  expect(command).toHaveFocus();

  // Pressing Space sets the active state on the focused command.
  await press.down.Space();
  expect(command).toHaveAttribute("data-active");

  // The example's own onKeyUp calls preventDefault to suppress the click on
  // release. That must only suppress the click, not skip the state clearing,
  // otherwise the element stays stuck looking pressed.
  await press.up.Space();
  expect(command).not.toHaveAttribute("data-active");
});
