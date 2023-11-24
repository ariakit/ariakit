import type { AriaHasPopup, AriaRole } from "./types.js";

/**
 * It's `true` if it is running in a browser environment or `false` if it is not
 * (SSR).
 * @example
 * const title = canUseDOM ? document.title : "";
 */
export const canUseDOM = checkIsBrowser();

// Check if we can use the DOM. Useful for SSR purposes
function checkIsBrowser() {
  return typeof window !== "undefined" && !!window.document?.createElement;
}

/**
 * Returns `element.ownerDocument || document`.
 */
export function getDocument(node?: Node | null): Document {
  return node ? node.ownerDocument || (node as Document) : document;
}

/**
 * Returns `element.ownerDocument.defaultView || window`.
 */
export function getWindow(node?: Node | null): Window {
  return getDocument(node).defaultView || window;
}

/**
 * Returns `element.ownerDocument.activeElement`.
 */
export function getActiveElement(
  node?: Node | null,
  activeDescendant = false,
): HTMLElement | null {
  const { activeElement } = getDocument(node);
  if (!activeElement?.nodeName) {
    // In IE11, activeElement might be an empty object if we're interacting
    // with elements inside of an iframe.
    return null;
  }
  if (isFrame(activeElement) && activeElement.contentDocument) {
    return getActiveElement(
      activeElement.contentDocument.body,
      activeDescendant,
    );
  }
  if (activeDescendant) {
    const id = activeElement.getAttribute("aria-activedescendant");
    if (id) {
      const element = getDocument(activeElement).getElementById(id);
      if (element) {
        return element;
      }
    }
  }
  return activeElement as HTMLElement | null;
}

/**
 * Similar to `Element.prototype.contains`, but a little bit faster when
 * `element` is the same as `child`.
 * @example
 * contains(
 *   document.getElementById("parent"),
 *   document.getElementById("child")
 * );
 */
export function contains(parent: Node, child: Node): boolean {
  return parent === child || parent.contains(child);
}

/**
 * Checks whether `element` is a frame element.
 */
export function isFrame(element: Element): element is HTMLIFrameElement {
  return element.tagName === "IFRAME";
}

/**
 * Checks whether `element` is a native HTML button element.
 * @example
 * isButton(document.querySelector("button")); // true
 * isButton(document.querySelector("input[type='button']")); // true
 * isButton(document.querySelector("div")); // false
 * isButton(document.querySelector("input[type='text']")); // false
 * isButton(document.querySelector("div[role='button']")); // false
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
 * Checks if the element is visible or not.
 */
export function isVisible(element: Element) {
  const htmlElement = element as HTMLElement;
  return (
    htmlElement.offsetWidth > 0 ||
    htmlElement.offsetHeight > 0 ||
    element.getClientRects().length > 0
  );
}

/**
 * Ponyfill for `Element.prototype.closest`
 * @example
 * closest(document.getElementById("id"), "div");
 * // same as
 * document.getElementById("id").closest("div");
 */
export function closest<K extends keyof HTMLElementTagNameMap>(
  element: Element,
  selectors: K,
): HTMLElementTagNameMap[K];
export function closest<K extends keyof SVGElementTagNameMap>(
  element: Element,
  selectors: K,
): SVGElementTagNameMap[K];
export function closest<T extends Element = Element>(
  element: Element,
  selectors: string,
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
 * by the ability to select within the input.
 * @example
 * isTextField(document.querySelector("div")); // false
 * isTextField(document.querySelector("input")); // true
 * isTextField(document.querySelector("input[type='button']")); // false
 * isTextField(document.querySelector("textarea")); // true
 */
export function isTextField(
  element: Element,
): element is HTMLInputElement | HTMLTextAreaElement {
  try {
    const isTextInput =
      element instanceof HTMLInputElement && element.selectionStart !== null;
    const isTextArea = element.tagName === "TEXTAREA";
    return isTextInput || isTextArea || false;
  } catch (error) {
    // Safari throws an exception when trying to get `selectionStart` on
    // non-text <input> elements (which, understandably, don't have the text
    // selection API). We catch this via a try/catch block, as opposed to a more
    // explicit check of the element's input types, because of Safari's
    // non-standard behavior. This also means we don't have to worry about the
    // list of input types that support `selectionStart` changing as the HTML
    // spec evolves over time.
    return false;
  }
}

/**
 * Returns the element's role attribute, if it has one.
 */
export function getPopupRole(
  element?: Element | null,
  fallback?: AriaHasPopup,
) {
  const allowedPopupRoles = ["dialog", "menu", "listbox", "tree", "grid"];
  const role = element?.getAttribute("role");
  if (role && allowedPopupRoles.indexOf(role) !== -1) {
    return role as "dialog" | "menu" | "listbox" | "tree" | "grid";
  }
  return fallback;
}

/**
 * Returns the item role attribute based on the popup's role.
 */
export function getPopupItemRole(
  element?: Element | null,
  fallback?: AriaRole,
) {
  const itemRoleByPopupRole = {
    menu: "menuitem",
    listbox: "option",
    tree: "treeitem",
    grid: "gridcell",
  };
  const popupRole = getPopupRole(element);
  if (!popupRole) return fallback;
  const key = popupRole as keyof typeof itemRoleByPopupRole;
  return itemRoleByPopupRole[key] ?? fallback;
}

/**
 * Returns the start and end offsets of the selection in the element.
 */
export function getTextboxSelection(element: HTMLElement) {
  let start = 0;
  let end = 0;
  if (isTextField(element)) {
    start = element.selectionStart || 0;
    end = element.selectionEnd || 0;
  } else if (element.isContentEditable) {
    const selection = getDocument(element).getSelection();
    if (
      selection?.rangeCount &&
      selection.anchorNode &&
      contains(element, selection.anchorNode) &&
      selection.focusNode &&
      contains(element, selection.focusNode)
    ) {
      const range = selection.getRangeAt(0);
      const nextRange = range.cloneRange();
      nextRange.selectNodeContents(element);
      nextRange.setEnd(range.startContainer, range.startOffset);
      start = nextRange.toString().length;
      nextRange.setEnd(range.endContainer, range.endOffset);
      end = nextRange.toString().length;
    }
  }
  return { start, end };
}

/**
 * Calls `element.scrollIntoView()` if the element is hidden or partly hidden in
 * the viewport.
 */
export function scrollIntoViewIfNeeded(
  element: Element,
  arg?: boolean | ScrollIntoViewOptions,
) {
  if (isPartiallyHidden(element) && "scrollIntoView" in element) {
    element.scrollIntoView(arg);
  }
}

/**
 * Returns the scrolling container element of a given element.
 */
export function getScrollingElement(
  element?: Element | null,
): HTMLElement | Element | null {
  if (!element) return null;
  if (element.clientHeight && element.scrollHeight > element.clientHeight) {
    const { overflowY } = getComputedStyle(element);
    const isScrollable = overflowY !== "visible" && overflowY !== "hidden";
    if (isScrollable) return element;
  } else if (element.clientWidth && element.scrollWidth > element.clientWidth) {
    const { overflowX } = getComputedStyle(element);
    const isScrollable = overflowX !== "visible" && overflowX !== "hidden";
    if (isScrollable) return element;
  }
  return (
    getScrollingElement(element.parentElement) ||
    document.scrollingElement ||
    document.body
  );
}

/**
 * Determines whether an element is hidden or partially hidden in the viewport.
 */
export function isPartiallyHidden(element: Element) {
  const elementRect = element.getBoundingClientRect();
  const scroller = getScrollingElement(element);
  if (!scroller) return false;
  const scrollerRect = scroller.getBoundingClientRect();

  const isHTML = scroller.tagName === "HTML";
  const scrollerTop = isHTML
    ? scrollerRect.top + scroller.scrollTop
    : scrollerRect.top;
  const scrollerBottom = isHTML ? scroller.clientHeight : scrollerRect.bottom;
  const scrollerLeft = isHTML
    ? scrollerRect.left + scroller.scrollLeft
    : scrollerRect.left;
  const scrollerRight = isHTML ? scroller.clientWidth : scrollerRect.right;

  const top = elementRect.top < scrollerTop;
  const left = elementRect.left < scrollerLeft;
  const bottom = elementRect.bottom > scrollerBottom;
  const right = elementRect.right > scrollerRight;

  return top || left || bottom || right;
}

/**
 * SelectionRange only works on a few types of input.
 * Calling `setSelectionRange` on a unsupported input type may throw an error on certain browsers.
 * To avoid it, we check if its type supports SelectionRange first.
 * It will be a noop to non-supported types until we find a workaround.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/setSelectionRange
 */
export function setSelectionRange(
  element: HTMLInputElement,
  ...args: Parameters<typeof HTMLInputElement.prototype.setSelectionRange>
) {
  if (/text|search|password|tel|url/i.test(element.type)) {
    element.setSelectionRange(...args);
  }
}
