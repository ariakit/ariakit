import { afterEach, expect, test } from "vitest";
import {
  getAllTabbableIn,
  getFirstTabbableIn,
  getLastTabbableIn,
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
  // fallback we get the first focusable element.
  expect(getFirstTabbableIn(container)).toBe(null);
  expect(getFirstTabbableIn(container, false, true)).toBe(negative);
});

test("getFirstTabbableIn fallback skips non-focusable candidates", () => {
  const container = document.createElement("div");
  container.innerHTML = `
    <button id="hidden" tabindex="-1">Hidden</button>
    <button id="visible" tabindex="-1">Visible</button>
  `;
  document.body.append(container);

  const hidden = container.querySelector("#hidden");
  const visible = container.querySelector("#visible");
  if (!hidden || !visible) {
    throw new Error("Expected elements");
  }

  setNotVisible(hidden);
  setVisible(visible);

  // No tabbable elements (both are tabindex="-1"). The fallback must skip the
  // non-focusable hidden button and return the first focusable one, not just
  // the first selector match.
  expect(getFirstTabbableIn(container, false, true)).toBe(visible);
});

test("getAllTabbableIn fallback returns only focusable candidates", () => {
  const container = document.createElement("div");
  container.innerHTML = `
    <button id="hidden" tabindex="-1">Hidden</button>
    <button id="visible" tabindex="-1">Visible</button>
  `;
  document.body.append(container);

  const hidden = container.querySelector("#hidden");
  const visible = container.querySelector("#visible");
  if (!hidden || !visible) {
    throw new Error("Expected elements");
  }

  setNotVisible(hidden);
  setVisible(visible);

  // No tabbable elements (both are tabindex="-1"). The fallback must drop the
  // non-focusable hidden button instead of returning every selector match.
  expect(getAllTabbableIn(container, false, true)).toEqual([visible]);
});

test("getLastTabbableIn fallback returns the last focusable candidate", () => {
  const container = document.createElement("div");
  container.innerHTML = `
    <button id="visible" tabindex="-1">Visible</button>
    <button id="hidden" tabindex="-1">Hidden</button>
  `;
  document.body.append(container);

  const visible = container.querySelector("#visible");
  const hidden = container.querySelector("#hidden");
  if (!visible || !hidden) {
    throw new Error("Expected elements");
  }

  setVisible(visible);
  setNotVisible(hidden);

  // No tabbable elements (both are tabindex="-1"). The fallback must skip the
  // trailing non-focusable hidden button and return the last focusable one,
  // not just the last selector match.
  expect(getLastTabbableIn(container, false, true)).toBe(visible);
});

test("getFirstTabbableIn returns null for empty containers", () => {
  const container = document.createElement("div");
  document.body.append(container);

  expect(getFirstTabbableIn(container)).toBe(null);
  expect(getFirstTabbableIn(container, true, true)).toBe(null);
});
