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

test.each([
  { modifier: "Control", options: { ctrlKey: true } },
  { modifier: "Meta", options: { metaKey: true } },
])(
  "type dispatches $modifier key events without inserting text",
  async ({ options }) => {
    const input = createInput("draft");
    const events: Array<Record<string, unknown>> = [];
    const onInput = vi.fn();
    const onChange = trackChange(input);
    const recordEvent = (event: KeyboardEvent) => {
      events.push({
        type: event.type,
        code: event.code,
        commandModified: event.ctrlKey || event.metaKey,
      });
    };
    input.addEventListener("keydown", recordEvent);
    input.addEventListener("keypress", recordEvent);
    input.addEventListener("keyup", recordEvent);
    input.addEventListener("input", onInput);
    input.setSelectionRange(input.value.length, input.value.length);

    await type("k", input, options);
    await blur(input);

    expect(events).toEqual([
      { type: "keydown", code: "KeyK", commandModified: true },
      { type: "keyup", code: "KeyK", commandModified: true },
    ]);
    expect(input.value).toBe("draft");
    expect(onInput).not.toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
  },
);

test.each([
  {
    char: "\b",
    expectedValue: "draf",
    key: "Backspace",
    modifier: "Control",
    options: { ctrlKey: true },
    position: 5,
  },
  {
    char: "\x7f",
    expectedValue: "draf",
    key: "Delete",
    modifier: "Control",
    options: { ctrlKey: true },
    position: 4,
  },
  {
    char: "\b",
    expectedValue: "draf",
    key: "Backspace",
    modifier: "Meta",
    options: { metaKey: true },
    position: 5,
  },
  {
    char: "\x7f",
    expectedValue: "draf",
    key: "Delete",
    modifier: "Meta",
    options: { metaKey: true },
    position: 4,
  },
])(
  "type preserves $modifier+$key deletion",
  async ({ char, expectedValue, options, position }) => {
    const input = createInput("draft");
    const onInput = vi.fn();
    input.addEventListener("input", onInput);
    input.setSelectionRange(position, position);

    await type(char, input, options);

    expect(input.value).toBe(expectedValue);
    expect(onInput).toHaveBeenCalledOnce();
  },
);

test.each([
  { modifier: "Control", options: { ctrlKey: true } },
  { modifier: "Meta", options: { metaKey: true } },
])(
  "type preserves $modifier+Backspace deletion in an email input",
  async ({ options }) => {
    const input = createInput("draft");
    input.type = "email";

    await type("\b", input, options);

    expect(input).toHaveValue("draf");
    expect(input).toHaveAttribute("type", "email");
  },
);

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
