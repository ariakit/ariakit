import { hasAttribute } from "./hasAttribute";
import { isVisibleInDOM } from "./isVisibleInDOM";

const selector =
  "input, select, textarea, a[href], button, [tabindex], audio[controls], video[controls], [contenteditable]:not([contenteditable=false])";

function hasNegativeTabIndex(element: Element) {
  return element.getAttribute("tabindex") === "-1";
}

function isContentEditable(element: Element) {
  const value = element.getAttribute("contenteditable");
  return value != null && value !== "false";
}

export function isFocusable(element: Element) {
  if (!isVisibleInDOM(element)) return false;

  const { localName } = element;
  const focusableTags = ["input", "select", "textarea", "button"];

  if (focusableTags.indexOf(localName) >= 0) return true;

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
  if (hasNegativeTabIndex(element)) return false;
  if (hasAttribute(element, "disabled")) return false;
  if (element.getAttribute("aria-disabled") === "true") return false;
  return true;
}

export function selectAllFocusableIn<T extends Element>(container: T) {
  const allFocusable = Array.from(container.querySelectorAll<T>(selector));
  return allFocusable.filter(isFocusable);
}

export function selectFirstFocusableIn<T extends Element>(container: T) {
  const allFocusable = selectAllFocusableIn(container);
  return allFocusable.length ? allFocusable[0] : null;
}

export function selectAllTabbableIn<T extends Element>(
  container: T,
  fallbackToFocusable?: boolean
) {
  const focusable = Array.from(container.querySelectorAll<T>(selector));
  const allTabbable = focusable.filter(isTabbable);
  if (!allTabbable.length && fallbackToFocusable) {
    return focusable;
  }
  return allTabbable;
}

export function selectFirstTabbableIn<T extends Element>(
  container: T,
  fallbackToFocusable?: boolean
) {
  const allTabbable = selectAllTabbableIn(container, fallbackToFocusable);
  return allTabbable.length ? allTabbable[0] : null;
}

export function selectLastTabbableIn<T extends Element>(
  container: T,
  fallbackToFocusable?: boolean
) {
  const allTabbable = selectAllTabbableIn(container, fallbackToFocusable);
  return allTabbable.length ? allTabbable[allTabbable.length - 1] : null;
}
