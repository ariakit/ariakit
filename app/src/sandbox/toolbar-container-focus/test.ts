import { focus, press, q, sleep, type } from "@ariakit/test";
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
  const input = q.textbox("Message");

  input.focus();
  expect(input).toHaveFocus();

  await press.down.Enter(input, {
    isComposing: true,
  });

  expect(input).toHaveFocus();
});

test("keeps focus in the field on Safari composing Enter", async () => {
  const input = q.textbox("Message");

  input.focus();
  expect(input).toHaveFocus();

  await pressSafariComposingEnter(input);

  expect(input).toHaveFocus();
});

// Reproduces https://github.com/ariakit/ariakit/issues/6300
test.each([
  { key: "Backspace", text: "\b" },
  { key: "Delete", text: "\x7f" },
])("keeps focus in the field after a no-op $key", async ({ text }) => {
  const container = q.group("Empty font family");
  const input = q.textbox("Empty font family");

  await focus(q.button("Before empty toolbar"));
  await press.Tab();
  expect(container).toHaveFocus();

  await type(text, container);
  expect(input).toHaveFocus();

  await type("a");
  expect(input).toHaveValue("a");
  expect(input).toHaveFocus();
});
