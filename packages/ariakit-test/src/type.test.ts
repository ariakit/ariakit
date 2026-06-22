import { afterEach, expect, test, vi } from "vitest";
import { blur } from "./blur.ts";
import { press } from "./press.ts";
import { type } from "./type.ts";

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
