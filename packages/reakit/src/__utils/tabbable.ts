import { hasAttribute } from "./hasAttribute";

const focusableSelector =
  'input, select, textarea, a[href], button, [tabindex], audio[controls], video[controls], [contenteditable]:not([contenteditable="false"])';

const tabbableSelector = focusableSelector
  .split(", ")
  .map(selector => `${selector}:not([tabindex="-1"]):not([disabled])`)
  .join(", ");

function hasNegativeTabIndex(element: Element) {
  return element.getAttribute("tabindex") === "-1";
}

function isContentEditable(element: Element) {
  const value = element.getAttribute("contenteditable");
  return value != null && value !== "false";
}

export function isFocusable(element: Element) {
  const { localName } = element;
  const focusableTags = ["input", "select", "textarea", "button"];
  if (focusableTags.indexOf(localName) >= 0) {
    return true;
  }
  const others = {
    a: () => hasAttribute(element, "href"),
    audio: () => hasAttribute(element, "controls"),
    video: () => hasAttribute(element, "controls")
  };
  if (localName in others) {
    return others[localName as keyof typeof others]();
  }
  return isContentEditable(element);
}

export function isTabbable(element: Element) {
  if (!isFocusable(element)) return false;
  return !hasAttribute(element, "disabled") && !hasNegativeTabIndex(element);
}

export function selectFocusableIn<T extends Element>(container: T) {
  return container.querySelector<T>(focusableSelector);
}

export function selectAllFocusableIn<T extends Element>(container: T) {
  return container.querySelectorAll<T>(focusableSelector);
}

export function selectTabbableIn<T extends Element>(container: T) {
  return container.querySelector<T>(tabbableSelector);
}

export function selectAllTabbableIn<T extends Element>(container: T) {
  return container.querySelectorAll<T>(tabbableSelector);
}
