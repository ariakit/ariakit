import { afterEach, expect, test } from "vitest";
import {
  disableFocus,
  disableFocusIn,
  getAllTabbableIn,
  getClosestFocusable,
  getFirstTabbableIn,
  getLastTabbableIn,
  isTabbable,
  restoreFocusIn,
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

  // No tabbable elements: without the fallback we get null; with the fallback
  // we get the first focusable element.
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
  // trailing non-focusable hidden button and return the last focusable one, not
  // just the last selector match.
  expect(getLastTabbableIn(container, false, true)).toBe(visible);
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

function appendFrame(parent: Element, html = "") {
  const frame = document.createElement("iframe");
  parent.append(frame);
  const frameBody = frame.contentDocument?.body;
  if (!frameBody) {
    throw new Error("Expected frame body");
  }
  frameBody.innerHTML = html;
  setVisible(frame);
  for (const element of frameBody.querySelectorAll("*")) {
    setVisible(element);
  }
  return { frame, frameBody };
}

function getElement(root: ParentNode, selector: string) {
  const element = root.querySelector<HTMLElement>(selector);
  if (!element) {
    throw new Error(`Expected ${selector}`);
  }
  return element;
}

// https://github.com/ariakit/ariakit/issues/7963
test("restoreFocusIn restores saved tabindex values inside iframes", () => {
  const container = document.createElement("div");
  document.body.append(container);
  const first = appendFrame(
    container,
    `
      <button id="absent">Absent</button>
      <button id="zero" tabindex="0">Zero</button>
    `,
  );
  const second = appendFrame(
    container,
    `<button id="positive" tabindex="2">Positive</button>`,
  );
  const absent = getElement(first.frameBody, "#absent");
  const zero = getElement(first.frameBody, "#zero");
  const positive = getElement(second.frameBody, "#positive");

  for (let i = 0; i < 2; i++) {
    // disableFocusIn can skip the second iframe, so disable each element
    // directly to cover restoring several iframes.
    // https://github.com/ariakit/ariakit/issues/6328
    disableFocus(absent);
    disableFocus(zero);
    disableFocus(positive);

    restoreFocusIn(container);
    expect(absent.getAttribute("tabindex")).toBeNull();
    expect(zero.getAttribute("tabindex")).toBe("0");
    expect(positive.getAttribute("tabindex")).toBe("2");
    expect(absent.getAttribute("data-tabindex")).toBeNull();
    expect(zero.getAttribute("data-tabindex")).toBeNull();
    expect(positive.getAttribute("data-tabindex")).toBeNull();
  }
});

// https://github.com/ariakit/ariakit/issues/7963
test("restoreFocusIn restores nested iframes", () => {
  const container = document.createElement("div");
  document.body.append(container);
  const outer = appendFrame(container);
  const inner = appendFrame(outer.frameBody, `<button>Nested</button>`);
  const button = getElement(inner.frameBody, "button");

  disableFocusIn(container);
  expect(button.getAttribute("tabindex")).toBe("-1");

  restoreFocusIn(container);
  expect(button.getAttribute("tabindex")).toBeNull();
});

// https://github.com/ariakit/ariakit/issues/7963
test("restoreFocusIn restores an iframe passed as the container", () => {
  const { frame, frameBody } = appendFrame(
    document.body,
    `<button>Inside</button>`,
  );
  const button = getElement(frameBody, "button");

  disableFocusIn(frame, true);
  expect(button.getAttribute("tabindex")).toBe("-1");

  restoreFocusIn(frame);
  expect(button.getAttribute("tabindex")).toBeNull();
});

// https://github.com/ariakit/ariakit/issues/7963
test("restoreFocusIn restores iframes hidden after focus was disabled", () => {
  const container = document.createElement("div");
  document.body.append(container);
  const { frame, frameBody } = appendFrame(
    container,
    `<button>Hidden</button>`,
  );
  const button = getElement(frameBody, "button");

  disableFocusIn(container);
  setNotVisible(frame);
  setNotVisible(button);

  restoreFocusIn(container);
  expect(button.getAttribute("tabindex")).toBeNull();
});

// https://github.com/ariakit/ariakit/issues/7963
test("restoreFocusIn skips iframes without an accessible document", () => {
  const container = document.createElement("div");
  container.innerHTML = `<button>Outer</button>`;
  document.body.append(container);
  const outerButton = getElement(container, "button");
  setVisible(outerButton);
  const { frame } = appendFrame(container, `<button>Removed</button>`);

  disableFocusIn(container);
  const crossOriginFrame = document.createElement("iframe");
  container.append(crossOriginFrame);
  // A cross-origin iframe exposes no contentDocument.
  Object.defineProperty(crossOriginFrame, "contentDocument", { value: null });
  frame.remove();

  expect(() => restoreFocusIn(container)).not.toThrow();
  expect(outerButton.getAttribute("tabindex")).toBeNull();
});

// https://github.com/ariakit/ariakit/issues/7963
test("restoreFocusIn restores the current document of a navigated iframe", () => {
  const container = document.createElement("div");
  document.body.append(container);
  const { frame } = appendFrame(container, `<button>Old</button>`);

  disableFocusIn(container);
  // Navigation replaces the frame document. Elements from the old document are
  // not restored, and the new document keeps its own tabindex values.
  const nextDocument = document.implementation.createHTMLDocument();
  nextDocument.body.innerHTML = `<button tabindex="0">New</button>`;
  Object.defineProperty(frame, "contentDocument", { value: nextDocument });
  const nextButton = getElement(nextDocument.body, "button");

  expect(() => restoreFocusIn(container)).not.toThrow();
  expect(nextButton.getAttribute("tabindex")).toBe("0");
});
