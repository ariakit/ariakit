import { focus, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

// See https://github.com/ariakit/ariakit/issues/6217

test("releasing Space with Meta held clears data-active", async () => {
  const command = q.text("Meta release");
  await focus(command);
  expect(command).toHaveFocus();

  // Pressing Space sets the active ("pressed") state on a non-native command.
  await press.down.Space();
  expect(command).toHaveAttribute("data-active");

  // Releasing Space while Meta is held short-circuits onKeyUp's `metaKey` guard.
  // Releasing the key should always clear the active state, otherwise the element
  // stays stuck in a visually "pressed" state. Focus stays on the command here,
  // so the keyup lands on it as `press.up` targets the focused element.
  await press.up.Space(null, { metaKey: true });
  expect(command).not.toHaveAttribute("data-active");
});

test("releasing Space clears data-active when the element becomes disabled mid-press", async () => {
  const command = q.text("Disable on press");
  await focus(command);
  expect(command).toHaveFocus();

  // Pressing Space sets the active state and disables the element (the example
  // flips `disabled` in its own keydown handler). A disabled command must not
  // stay stuck looking pressed, so the active state is cleared as soon as it
  // becomes disabled.
  await press.down.Space();
  expect(command).toHaveAttribute("aria-disabled", "true");
  expect(command).not.toHaveAttribute("data-active");

  // Releasing Space lands on whatever holds focus — in a real browser the
  // disabled element has blurred to the body, so the keyup never reaches the
  // command. The active state must already be (and stay) cleared regardless.
  // Note: happy-dom does not blur the disabled element, so here the keyup still
  // reaches the command; `test-browser.ts` is the authoritative coverage for the
  // real blur-to-body keyup routing.
  await press.up.Space();
  expect(command).not.toHaveAttribute("data-active");
});
