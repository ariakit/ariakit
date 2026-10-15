import { afterEach, expect, test, vi } from "vitest";
import { blur } from "./blur.ts";
import { press } from "./press.ts";
import { type } from "./type.ts";
import "./shims.ts";

afterEach(() => {
  document.body.innerHTML = "";
});

function createInput(value = "") {
  const input = document.createElement("input");
  input.value = value;
  document.body.append(input);
  return input;
}

function trackChange(element: Element) {
  const onChange = vi.fn();
  element.addEventListener("change", onChange);
  return onChange;
}

test("type does not dispatch change after typing into a readonly field", async () => {
  const input = createInput("locked");
  const onChange = trackChange(input);
  input.readOnly = true;

  await type("abc", input);
  await blur(input);

  expect(input.value).toBe("locked");
  expect(onChange).not.toHaveBeenCalled();
});

test("type does not dispatch change after a prevented keydown", async () => {
  const input = createInput();
  const onChange = trackChange(input);
  input.addEventListener("keydown", (event) => {
    event.preventDefault();
  });

  await type("abc", input);
  await blur(input);

  expect(input.value).toBe("");
  expect(onChange).not.toHaveBeenCalled();
});

test("type does not dispatch change after typing on a non-text field", async () => {
  const target = document.createElement("div");
  const onChange = trackChange(target);
  target.tabIndex = 0;
  target.textContent = "Delta";
  document.body.append(target);

  await type("d", target);
  await blur(target);

  expect(onChange).not.toHaveBeenCalled();
});

test.each([
  { name: "Backspace", pressKey: press.Backspace },
  { name: "Delete", pressKey: press.Delete },
])(
  "press.$name does not dispatch change after a no-op edit",
  async ({ pressKey }) => {
    const input = createInput();
    const onChange = trackChange(input);

    await pressKey(input);
    await blur(input);

    expect(input.value).toBe("");
    expect(onChange).not.toHaveBeenCalled();
  },
);

test("type dispatches change on blur after editing a text field", async () => {
  const input = createInput("a");
  const onChange = trackChange(input);
  input.setSelectionRange(input.value.length, input.value.length);

  await type("b", input);
  await blur(input);

  expect(input.value).toBe("ab");
  expect(onChange).toHaveBeenCalledOnce();
});

test("type marks the text field that receives text after focus moves", async () => {
  const firstInput = createInput();
  const secondInput = createInput();
  const onFirstInputChange = trackChange(firstInput);
  const onSecondInputChange = trackChange(secondInput);
  firstInput.addEventListener("keydown", () => {
    secondInput.focus();
  });

  await type("a", firstInput);
  await blur(secondInput);

  expect(firstInput.value).toBe("");
  expect(secondInput.value).toBe("a");
  expect(onFirstInputChange).not.toHaveBeenCalled();
  expect(onSecondInputChange).toHaveBeenCalledOnce();
});

// Composed text goes out through `dispatch.compositionUpdate`, which is the one
// path in the repository that already depends on `data` reaching a listener.
// https://github.com/ariakit/ariakit/issues/7174
test("type reports each composed character on the composition event", async () => {
  const input = createInput();
  const composed: string[] = [];
  input.addEventListener("compositionupdate", (event) => {
    composed.push(event.data);
  });

  await type("ni", input, { isComposing: true });

  expect(composed).toEqual(["n", "i"]);
});

test.each([
  { name: "Backspace on an empty field", value: "", caret: 0, key: "\b" },
  { name: "Delete on an empty field", value: "", caret: 0, key: "\x7f" },
  { name: "Backspace at the start", value: "abc", caret: 0, key: "\b" },
  { name: "Delete at the end", value: "abc", caret: 3, key: "\x7f" },
])("type does not dispatch input for $name", async ({ value, caret, key }) => {
  const input = createInput(value);
  const onInput = vi.fn();
  input.addEventListener("input", onInput);
  input.setSelectionRange(caret, caret);

  await type(key, input);

  expect(input.value).toBe(value);
  expect(input.selectionStart).toBe(caret);
  expect(input.selectionEnd).toBe(caret);
  expect(onInput).not.toHaveBeenCalled();
});

test("type dispatches input when replacing selected text with the same text", async () => {
  const input = createInput("ab");
  const onInput = vi.fn();
  input.addEventListener("input", onInput);
  input.setSelectionRange(0, 1);

  await type("a", input);

  expect(input.value).toBe("ab");
  expect(input.selectionStart).toBe(1);
  expect(input.selectionEnd).toBe(1);
  expect(onInput).toHaveBeenCalledOnce();
});

test("type edits an email input after keydown moves focus to it", async () => {
  const button = document.createElement("button");
  const input = createInput();
  input.type = "email";
  document.body.append(button);
  button.addEventListener("keydown", () => input.focus());

  await type("e", input);
  await type("23", button);

  expect(input.value).toBe("e23");
  expect(input.type).toBe("email");
  expect(document.activeElement).toBe(input);
});

test("type keeps appending to an email input across calls", async () => {
  const input = createInput();
  input.type = "email";

  await type("ab", input);
  await type("cd", input);

  expect(input.value).toBe("abcd");
  expect(input.type).toBe("email");
});
