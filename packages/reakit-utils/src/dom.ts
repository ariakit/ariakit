import { ComponentType } from "react";

/**
 * It's `true` if it is running in a browser environment or `false` if it is not (SSR).
 *
 * @example
 * import { canUseDOM } from "reakit-utils";
 *
 * const title = canUseDOM ? document.title : "";
 */
export const canUseDOM = checkIsBrowser();

// Check if we can use the DOM. Useful for SSR purposes
function checkIsBrowser() {
  return typeof window !== "undefined" && !!window.document?.createElement;
}

/**
 * Checks if a given string exists in the user agent string.
 */
export function isUA(string: string) {
  if (!canUseDOM) return false;
  return window.navigator.userAgent.indexOf(string) !== -1;
}

/**
 * Returns `element.ownerDocument || document`.
 */
export function getDocument(element?: Element | Document | null): Document {
  return element ? element.ownerDocument || (element as Document) : document;
}

/**
 * Returns `element.ownerDocument.defaultView || window`.
 */
export function getWindow(element?: Element): Window {
  return getDocument(element).defaultView || window;
}

/**
 * Returns `element.ownerDocument.activeElement`.
 */
export function getActiveElement(element?: Element | Document | null) {
  const { activeElement } = getDocument(element);
  if (!activeElement?.nodeName) {
    // In IE11, activeElement might be an empty object if we're interacting
    // with elements inside of an iframe.
    return null;
  }
  return activeElement;
}

/**
 * Similar to `Element.prototype.contains`, but a little bit faster when
 * `element` is the same as `child`.
 *
 * @example
 * import { contains } from "reakit-utils";
 *
 * contains(document.getElementById("parent"), document.getElementById("child"));
 */
export function contains(parent: Element, child: Element): boolean {
  return parent === child || parent.contains(child);
}

/**
 * Checks whether `element` is a native HTML button element.
 *
 * @example
 * import { isButton } from "reakit-utils";
 *
 * isButton(document.querySelector("button")); // true
 * isButton(document.querySelector("input[type='button']")); // true
 * isButton(document.querySelector("div")); // false
 * isButton(document.querySelector("input[type='text']")); // false
 * isButton(document.querySelector("div[role='button']")); // false
 *
 * @returns {boolean}
 */
export function isButton(element: { tagName: string; type?: string }) {
  const tagName = element.tagName.toLowerCase();
  if (tagName === "button") return true;
  if (tagName === "input" && element.type) {
    return buttonInputTypes.indexOf(element.type) !== -1;
  }
  return false;
}

const buttonInputTypes = [
  "button",
  "color",
  "file",
  "image",
  "reset",
  "submit",
];

/**
 * Ponyfill for `Element.prototype.matches`
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/matches
 */
export function matches(element: Element, selectors: string): boolean {
  if ("matches" in element) {
    return element.matches(selectors);
  }
  if ("msMatchesSelector" in element) {
    return (element as any).msMatchesSelector(selectors);
  }
  return (element as any).webkitMatchesSelector(selectors);
}

/**
 * Ponyfill for `Element.prototype.closest`
 *
 * @example
 * import { closest } from "reakit-utils";
 *
 * closest(document.getElementById("id"), "div");
 * // same as
 * document.getElementById("id").closest("div");
 */
export function closest<K extends keyof HTMLElementTagNameMap>(
  element: Element,
  selectors: K
): HTMLElementTagNameMap[K];
export function closest<K extends keyof SVGElementTagNameMap>(
  element: Element,
  selectors: K
): SVGElementTagNameMap[K];
export function closest<T extends Element = Element>(
  element: Element,
  selectors: string
): T | null;
export function closest(element: Element, selectors: string) {
  if ("closest" in element) return element.closest(selectors);
  do {
    if (matches(element, selectors)) return element;
    element = (element.parentElement || element.parentNode) as any;
  } while (element !== null && element.nodeType === 1);
  return null;
}

/**
 * Check whether the given element is a text field, where text field is defined
 * by the ability to select within the input, or that it is contenteditable.
 *
 * @example
 * import { isTextField } from "reakit-utils";
 *
 * isTextField(document.querySelector("div")); // false
 * isTextField(document.querySelector("input")); // true
 * isTextField(document.querySelector("input[type='button']")); // false
 * isTextField(document.querySelector("textarea")); // true
 * isTextField(document.querySelector("div[contenteditable='true']")); // true
 */
export function isTextField(element: HTMLElement): boolean {
  try {
    const isTextInput =
      element instanceof HTMLInputElement && element.selectionStart !== null;
    const isTextArea = element.tagName === "TEXTAREA";
    const isContentEditable = element.contentEditable === "true";
    return isTextInput || isTextArea || isContentEditable || false;
  } catch (error) {
    // Safari throws an exception when trying to get `selectionStart`
    // on non-text <input> elements (which, understandably, don't
    // have the text selection API). We catch this via a try/catch
    // block, as opposed to a more explicit check of the element's
    // input types, because of Safari's non-standard behavior. This
    // also means we don't have to worry about the list of input
    // types that support `selectionStart` changing as the HTML spec
    // evolves over time.
    return false;
  }
}

/**
 * Returns the native tag name of the passed element. If the element is not
 * provided, the second argument `defaultType` will be used, but only if it's
 * a string.
 *
 * @example
 * import { getNativeElementType } from "reakit-utils";
 *
 * getNativeElementType(document.querySelector("div")); // "div"
 * getNativeElementType(document.querySelector("button")); // "button"
 * getNativeElementType(null, "button"); // "button"
 * getNativeElementType(null, SomeComponent); // undefined
 */
export function getNativeElementType(
  element?: Element | null,
  defaultType?: string | ComponentType
) {
  const type =
    element?.tagName ||
    (typeof defaultType === "string" ? defaultType : undefined);

  return type?.toLowerCase();
}
