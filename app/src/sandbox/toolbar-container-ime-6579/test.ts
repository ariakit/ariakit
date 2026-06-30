import { press, q } from "@ariakit/test";
import { expect, test } from "vitest";

// Reproduces https://github.com/ariakit/ariakit/issues/6579
test("keeps focus in the field on composing Enter", async () => {
  const input = q.textbox.ensure("Message");

  input.focus();
  expect(input).toHaveFocus();

  await press.down.Enter(input, {
    isComposing: true,
  });

  expect(input).toHaveFocus();
});
