import { afterEach, expect, test } from "vitest";
import {
  getClosestFocusable,
  getFirstTabbableIn,
  isTabbable,
} from "./focus.ts";

function setVisible(element: Element) {
  Object.defineProperty(element, "checkVisibility", {
    configurable: true,
    value: () => true,
  });
}

function setNotVisible(element: Element) {
  Object.defineProperty(element, "checkVisibility", {
    configurable: true,
    value: () => false,
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

test("getFirstTabbableIn returns the first tabbable element in order", () => {
  const container = document.createElement("div");
  container.innerHTML = `
    <button id="negative" tabindex="-1">Negative</button>
    <button id="hidden">Hidden</button>
    <input id="first" />
    <button id="second">Second</button>
  `;
  document.body.append(container);

  const negative = container.querySelector("#negative");
  const hidden = container.querySelector("#hidden");
  const first = container.querySelector("#first");
  const second = container.querySelector("#second");
  if (!negative || !hidden || !first || !second) {
    throw new Error("Expected elements");
  }

  setVisible(negative);
  setNotVisible(hidden);
  setVisible(first);
  setVisible(second);

  expect(getFirstTabbableIn(container)).toBe(first);
});

test("getFirstTabbableIn returns the container itself when included and tabbable", () => {
  const container = document.createElement("div");
  container.tabIndex = 0;
  container.innerHTML = `<button id="child">Child</button>`;
  document.body.append(container);

  const child = container.querySelector("#child");
  if (!child) {
    throw new Error("Expected child");
  }

  setVisible(container);
  setVisible(child);

  expect(getFirstTabbableIn(container, true)).toBe(container);
  expect(getFirstTabbableIn(container)).toBe(child);
});

test("getFirstTabbableIn falls back to the first focusable candidate", () => {
  const container = document.createElement("div");
  container.innerHTML = `
    <button id="negative" tabindex="-1">Negative</button>
    <button id="other" tabindex="-1">Other</button>
  `;
  document.body.append(container);

  const negative = container.querySelector("#negative");
  if (!negative) {
    throw new Error("Expected element");
  }

  setVisible(negative);

  // No tabbable elements: without the fallback we get null; with the
  // fallback we get the first element matching the focusable selector.
  expect(getFirstTabbableIn(container)).toBe(null);
  expect(getFirstTabbableIn(container, false, true)).toBe(negative);
});

test("getFirstTabbableIn returns null for empty containers", () => {
  const container = document.createElement("div");
  document.body.append(container);

  expect(getFirstTabbableIn(container)).toBe(null);
  expect(getFirstTabbableIn(container, true, true)).toBe(null);
});

test("getClosestFocusable walks past a selector-matching but non-focusable ancestor", () => {
  const button = document.createElement("button");
  // Box-less wrapper (e.g. display: contents) that matches the focusable
  // selector via [tabindex] but is reported as not visible, so isFocusable
  // rejects it. Self-inclusive closest() used to re-return it forever.
  const wrapper = document.createElement("div");
  wrapper.tabIndex = -1;
  const inner = document.createElement("span");
  wrapper.append(inner);
  button.append(wrapper);
  document.body.append(button);

  setVisible(button);
  setNotVisible(wrapper);

  expect(getClosestFocusable(inner)).toBe(button);
});

test("getClosestFocusable returns null when no focusable ancestor exists", () => {
  const wrapper = document.createElement("div");
  wrapper.tabIndex = -1;
  const inner = document.createElement("span");
  wrapper.append(inner);
  document.body.append(wrapper);

  setNotVisible(wrapper);

  expect(getClosestFocusable(inner)).toBe(null);
});
