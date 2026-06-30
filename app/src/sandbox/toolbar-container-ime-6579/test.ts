import { dispatch, q } from "@ariakit/test";
import { expect, test } from "vitest";

// Reproduces https://github.com/ariakit/ariakit/issues/6579
test("keeps focus in the field when Enter commits IME composition", async () => {
  const input = q.textbox.ensure("Message");

  input.focus();
  expect(input).toHaveFocus();

  const defaultAllowed = await dispatch.keyDown(input, {
    bubbles: true,
    cancelable: true,
    key: "Enter",
    isComposing: true,
  });

  expect(input).toHaveFocus();
  expect(defaultAllowed).toBe(true);
});
