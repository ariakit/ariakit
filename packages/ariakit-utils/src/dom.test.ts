import { afterEach, expect, test } from "vitest";
import {
  getTextboxSelection,
  getTextboxValue,
  isTextField,
  setSelectionRange,
} from "./dom.ts";

afterEach(() => {
  document.body.replaceChildren();
  document.getSelection()?.removeAllRanges();
});

test("detects text fields without throwing for unsupported inputs", () => {
  const text = document.createElement("input");
  text.type = "text";
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  const textarea = document.createElement("textarea");

  expect(isTextField(text)).toBe(true);
  expect(isTextField(checkbox)).toBe(false);
  expect(isTextField(textarea)).toBe(true);
});

test("reads selection offsets from text fields", () => {
  const input = document.createElement("input");
  input.value = "abcdef";
  document.body.append(input);

  setSelectionRange(input, 2, 5);

  expect(getTextboxValue(input)).toBe("abcdef");
  expect(getTextboxSelection(input)).toEqual({ start: 2, end: 5 });
});

test("reads selection offsets from contenteditable elements", () => {
  const editor = document.createElement("div");
  editor.textContent = "hello world";
  Object.defineProperty(editor, "isContentEditable", {
    configurable: true,
    value: true,
  });
  document.body.append(editor);

  const text = editor.firstChild;
  expect(text).toBeInstanceOf(Text);
  if (!text) {
    throw new Error("Expected contenteditable text node");
  }

  const range = document.createRange();
  range.setStart(text, 3);
  range.setEnd(text, 8);
  document.getSelection()?.addRange(range);

  expect(getTextboxValue(editor)).toBe("hello world");
  expect(getTextboxSelection(editor)).toEqual({ start: 3, end: 8 });
});

test("setSelectionRange skips input types that do not support text selection", () => {
  const color = document.createElement("input");
  color.type = "color";

  expect(() => setSelectionRange(color, 0, 1)).not.toThrow();
});
