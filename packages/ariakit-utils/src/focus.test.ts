// @vitest-environment jsdom
// Uses DOM APIs the default node test environment doesn't provide.
import { afterEach, expect, test } from "vitest";
import { isTabbable } from "./focus.ts";

function setVisible(element: Element) {
  Object.defineProperty(element, "checkVisibility", {
    configurable: true,
    value: () => true,
  });
}

afterEach(() => {
  document.body.replaceChildren();
});

test("treats only the active unchecked radio as tabbable within a group", () => {
  const form = document.createElement("form");
  form.innerHTML = `
    <input type="radio" name="group" value="a" />
    <input type="radio" name="group" value="b" />
    <input type="radio" name="other" value="c" />
  `;
  document.body.append(form);

  const [first, second, other] = form.querySelectorAll("input");
  if (!first) {
    throw new Error("Expected first radio");
  }
  if (!second) {
    throw new Error("Expected second radio");
  }
  if (!other) {
    throw new Error("Expected other radio");
  }

  setVisible(first);
  setVisible(second);
  setVisible(other);

  expect(isTabbable(first)).toBe(true);
  expect(isTabbable(second)).toBe(true);

  first.focus();

  expect(isTabbable(first)).toBe(true);
  expect(isTabbable(second)).toBe(false);
  expect(isTabbable(other)).toBe(true);

  second.checked = true;
  second.focus();

  expect(isTabbable(first)).toBe(false);
  expect(isTabbable(second)).toBe(true);
});

test("keeps radios outside a form tabbable", () => {
  const radio = document.createElement("input");
  radio.type = "radio";
  radio.name = "standalone";
  setVisible(radio);
  document.body.append(radio);

  expect(isTabbable(radio)).toBe(true);
});
