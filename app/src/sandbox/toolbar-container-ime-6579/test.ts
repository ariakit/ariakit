import { press, q } from "@ariakit/test";
import { expect, test } from "vitest";

// Reproduces https://github.com/ariakit/ariakit/issues/6579
test("keeps focus in the field when Enter commits IME composition", async () => {
  const input = q.textbox.ensure("Message");

  input.focus();
  expect(input).toHaveFocus();

  let defaultPrevented = false;
  input.addEventListener(
    "keydown",
    (event) => {
      queueMicrotask(() => {
        defaultPrevented = event.defaultPrevented;
      });
    },
    { once: true },
  );

  await press.down.Enter(input, {
    isComposing: true,
  });

  expect(input).toHaveFocus();
  expect(defaultPrevented).toBe(false);
});
