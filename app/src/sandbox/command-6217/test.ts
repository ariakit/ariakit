import { dispatch, focus, q, sleep } from "@ariakit/test";
import { expect, test } from "vitest";

// See https://github.com/ariakit/ariakit/issues/6217

test("releasing Space with Meta held clears data-active", async () => {
  const command = q.text.ensure("Meta release");
  await focus(command);
  expect(command).toHaveFocus();

  // Pressing Space sets the active ("pressed") state on a non-native command via
  // onKeyDown.
  await dispatch.keyDown(command, {
    key: " ",
    bubbles: true,
    cancelable: true,
  });
  await sleep();
  expect(command).toHaveAttribute("data-active");

  // Releasing Space while Meta is held short-circuits onKeyUp's `metaKey` guard.
  // Releasing the key should always clear the active state, otherwise the element
  // stays stuck in a visually "pressed" state.
  await dispatch.keyUp(command, {
    key: " ",
    metaKey: true,
    bubbles: true,
    cancelable: true,
  });
  await sleep();
  expect(command).not.toHaveAttribute("data-active");
});

test("releasing Space clears data-active when the element becomes disabled mid-press", async () => {
  const command = q.text.ensure("Disable on press");
  await focus(command);
  expect(command).toHaveFocus();

  // Pressing Space sets the active state and disables the element (the example
  // flips `disabled` in its own keydown handler).
  await dispatch.keyDown(command, {
    key: " ",
    bubbles: true,
    cancelable: true,
  });
  await sleep();
  expect(command).toHaveAttribute("data-active");
  expect(command).toHaveAttribute("aria-disabled", "true");

  // Now that the element is disabled, releasing Space short-circuits onKeyUp's
  // `disabled` guard. The active state must still be cleared.
  await dispatch.keyUp(command, { key: " ", bubbles: true, cancelable: true });
  await sleep();
  expect(command).not.toHaveAttribute("data-active");
});
