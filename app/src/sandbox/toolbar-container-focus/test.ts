import { press, q, sleep } from "@ariakit/test";
import { expect, test } from "vitest";

async function pressSafariComposingEnter(input: HTMLElement) {
  const event = new KeyboardEvent("keydown", {
    bubbles: true,
    cancelable: true,
    key: "Enter",
  });
  Object.defineProperty(event, "keyCode", { get: () => 229 });
  input.dispatchEvent(event);
  await sleep();
}

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

test("keeps focus in the field on Safari composing Enter", async () => {
  const input = q.textbox.ensure("Message");

  input.focus();
  expect(input).toHaveFocus();

  await pressSafariComposingEnter(input);

  expect(input).toHaveFocus();
});
