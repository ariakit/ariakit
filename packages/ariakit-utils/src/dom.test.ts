import { afterEach, expect, test } from "vitest";
import {
  getScrollingElement,
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

test("getScrollingElement falls back to the element's own document, not the global one", () => {
  const iframe = document.createElement("iframe");
  document.body.append(iframe);
  const frameDoc = iframe.contentDocument;
  expect(frameDoc).toBeTruthy();
  if (!frameDoc?.body) {
    throw new Error("Expected iframe document body");
  }

  // The element lives inside the iframe with no in-frame overflow container, so
  // the ancestor walk bottoms out at the document fallback. That fallback must
  // resolve against the iframe's own document, not the top-level page's.
  const item = frameDoc.createElement("div");
  frameDoc.body.append(item);

  const scroller = getScrollingElement(item);
  expect(scroller?.ownerDocument).toBe(frameDoc);
});

test("setSelectionRange skips input types that do not support text selection", () => {
  const color = document.createElement("input");
  color.type = "color";

  expect(() => setSelectionRange(color, 0, 1)).not.toThrow();
});
