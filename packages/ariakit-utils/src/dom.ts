/**
 * DOM helpers for browser, iframe, text input, popup, and scrolling behavior.
 * @module DOM utilities
 */

import { hasOwnProperty } from "./misc.ts";
import type { AriaHasPopup, AriaRole } from "./types.ts";

/**
 * It's `true` if it is running in a browser environment or `false` if it is not
 * (SSR).
 * @example
 * const title = canUseDOM ? document.title : "";
 */
export const canUseDOM = checkIsBrowser();

function checkIsBrowser() {
  return typeof window !== "undefined" && !!window.document?.createElement;
}

// A form exposes its controls as named properties that override built-ins, and
// a document does the same for the elements it names, so any member read while
// resolving a realm can answer with one of those instead: a control named
// `self` makes a form answer the window test, one named `ownerDocument` makes
// it answer the document lookup, and a form named `defaultView` makes a
// document answer the window lookup. The two guards below check what came back
// rather than trusting the member it came from.
// https://github.com/ariakit/ariakit/issues/7201
// https://github.com/ariakit/ariakit/issues/7215

// Typed the way `document.defaultView` is, because the interfaces a caller
// reads off a window, such as `PointerEvent`, are globals rather than members
// of `Window`.
function isWindow(value: unknown): value is Window & typeof globalThis {
  if (!value) return false;
  // A window is the only object that is its own `window`.
  return (value as Window).window === value;
}

// Taken from the prototype because a document names its own elements too, so
// one holding an element named `nodeType` answers that read with it. The getter
// bypasses that lookup and is brand-checked against the interface rather than
// the realm, so it still answers for a node belonging to a frame.
// https://github.com/ariakit/ariakit/pull/7213#discussion_r3816584472
const nodeTypeGetter =
  typeof Node === "undefined"
    ? undefined
    : // oxlint-disable-next-line typescript/unbound-method -- the receiver is supplied explicitly below
      Object.getOwnPropertyDescriptor(Node.prototype, "nodeType")?.get;

function isDocument(value: unknown): value is Document {
  if (!value) return false;
  // Node.DOCUMENT_NODE === 9.
  if (!nodeTypeGetter) return (value as Node).nodeType === 9;
  try {
    return nodeTypeGetter.call(value) === 9;
  } catch {
    // The brand check rejects anything that is not a node.
    return false;
  }
}

// Start at the prototype to bypass named properties while keeping `value` as
// the getter receiver, including for values from another realm.
function getDOMProperty(value: object, name: string) {
  return Reflect.get(Object.getPrototypeOf(value), name, value);
}

function ownsDocument(
  view: Window & typeof globalThis,
  ownerDocument: Document,
) {
  try {
    return view.document === ownerDocument;
  } catch {
    // A cross-origin window answers only an allowlist, which `document` is not
    // on, so refusing to answer is itself proof that it owns another document.
    return false;
  }
}

/**
 * Returns the document `node` belongs to, or the current one when it has none.
 */
export function getDocument(node?: Window | Document | Node | null): Document {
  if (!node) return document;
  if (isDocument(node)) return node;
  if (isWindow(node)) return node.document;
  const nodeDocument = (node as Node).ownerDocument;
  if (isDocument(nodeDocument)) return nodeDocument;
  const unshadowedDocument = getDOMProperty(node, "ownerDocument");
  if (isDocument(unshadowedDocument)) return unshadowedDocument;
  return document;
}

/**
 * Returns the window `node` belongs to, or the current one when it has none.
 */
export function getWindow(
  node?: Window | Document | Node | null,
): Window & typeof globalThis {
  if (!node) return self;
  if (isWindow(node)) return node;
  const nodeDocument = getDocument(node);
  const { defaultView } = nodeDocument;
  // Being a window is not enough, because the named getter answers with the
  // window of an `<iframe name="defaultView">`, which is a real window from
  // another realm. A window is only this document's view when it owns it back,
  // and `Window.document` cannot be shadowed the way `Document` members can.
  if (isWindow(defaultView) && ownsDocument(defaultView, nodeDocument)) {
    return defaultView;
  }
  const unshadowedView = getDOMProperty(nodeDocument, "defaultView");
  if (isWindow(unshadowedView)) return unshadowedView;
  return window;
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
  if (isFrame(activeElement) && activeElement.contentDocument?.body) {
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
 * Checks whether the given event target is an element.
 *
 * `event.target` and `event.relatedTarget` are `EventTarget`s, which aren't
 * necessarily elements — for example `window` or an `XMLHttpRequest` when an
 * event is dispatched programmatically. Calling `Element`-only methods such as
 * `hasAttribute` on those throws, so guard with this before treating them as
 * elements. When you only need a `Node` — for example to call `contains` — use
 * `isNode` instead.
 *
 * It tests `nodeType` rather than `instanceof Element` so that elements coming
 * from same-origin child frames (which `addGlobalEventListener` also listens
 * on) aren't wrongly rejected for belonging to a different realm.
 * @example
 * if (isElement(event.target)) {
 *   event.target.hasAttribute("data-active");
 * }
 */
export function isElement(
  target: EventTarget | null | undefined,
): target is Element {
  // Node.ELEMENT_NODE === 1.
  // Named-property collisions are objects, so numeric reads stay genuine.
  const nodeType = (target as Node | null)?.nodeType;
  return (
    nodeType === 1 ||
    (typeof nodeType === "object" &&
      getDOMProperty(target as object, "nodeType") === 1)
  );
}

/**
 * Checks whether the given event target is a node.
 *
 * Like `isElement`, but only requires the target to be a `Node` rather than an
 * element — useful before calling `contains`, which accepts any node. It still
 * rejects non-node `EventTarget`s (such as `window` or an `XMLHttpRequest`)
 * that would make `contains` throw.
 * @example
 * if (isNode(event.target)) {
 *   contains(element, event.target);
 * }
 */
export function isNode(target: EventTarget | null | undefined): target is Node {
  // Named-property collisions are objects, so numeric reads stay genuine.
  const nodeType = (target as Node | null)?.nodeType;
  return (
    typeof nodeType === "number" ||
    (typeof nodeType === "object" &&
      typeof getDOMProperty(target as object, "nodeType") === "number")
  );
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
 * Checks if the element is visible or not.
 */
export function isVisible(element: Element) {
  if (typeof element.checkVisibility === "function") {
    return element.checkVisibility();
  }
  const htmlElement = element as HTMLElement;
  return (
    htmlElement.offsetWidth > 0 ||
    htmlElement.offsetHeight > 0 ||
    element.getClientRects().length > 0
  );
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
    // Use tag names instead of realm-bound constructors so text fields from
    // same-origin child frames are recognized.
    if (element.tagName === "TEXTAREA") return true;
    if (element.tagName !== "INPUT") return false;
    return (element as HTMLInputElement).selectionStart !== null;
  } catch (_error) {
    // Safari throws for `selectionStart` on non-text inputs. Catching keeps
    // this future-proof as supported input types change.
    return false;
  }
}

/**
 * Check whether the given element is a text field or a content editable
 * element.
 */
export function isTextbox(element: HTMLElement) {
  return element.isContentEditable || isTextField(element);
}

/**
 * Returns the value of the text field or content editable element as a string.
 */
export function getTextboxValue(element: HTMLElement) {
  if (isTextField(element)) {
    return element.value;
  }
  if (element.isContentEditable) {
    const range = getDocument(element).createRange();
    range.selectNodeContents(element);
    return range.toString();
  }
  return "";
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

const allowedPopupRoles = ["dialog", "menu", "listbox", "tree", "grid"];

const itemRoleByPopupRole = {
  menu: "menuitem",
  listbox: "option",
  tree: "treeitem",
};

/**
 * Returns the popup role from the element's role attribute, if it has one.
 */
export function getPopupRole(
  element?: Element | null,
  fallback?: AriaHasPopup,
) {
  const role = element?.getAttribute("role");
  if (role && allowedPopupRoles.indexOf(role) !== -1) {
    return role as "dialog" | "menu" | "listbox" | "tree" | "grid";
  }
  return fallback;
}

/**
 * Returns the item role based on the popup role.
 */
export function getItemRoleByPopupRole(popupRole?: string | null) {
  if (popupRole == null) return;
  if (!hasOwnProperty(itemRoleByPopupRole, popupRole)) return;
  return itemRoleByPopupRole[popupRole];
}

/**
 * Returns the item role attribute based on the popup's role.
 */
export function getPopupItemRole(
  element?: Element | null,
  fallback?: AriaRole,
) {
  const popupRole = getPopupRole(element);
  if (typeof popupRole !== "string") return fallback;
  return getItemRoleByPopupRole(popupRole) ?? fallback;
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
  const isScrollableOverflow = (overflow: string) => {
    if (overflow === "auto") return true;
    if (overflow === "scroll") return true;
    return false;
  };
  if (element.clientHeight && element.scrollHeight > element.clientHeight) {
    const { overflowY } = getComputedStyle(element);
    if (isScrollableOverflow(overflowY)) return element;
  } else if (element.clientWidth && element.scrollWidth > element.clientWidth) {
    const { overflowX } = getComputedStyle(element);
    if (isScrollableOverflow(overflowX)) return element;
  }
  // If no ancestor scrolls, use the element's own document scroller; iframe
  // traversal would otherwise fall back to the top-level document.
  const doc = getDocument(element);
  return (
    getScrollingElement(element.parentElement) ||
    doc.scrollingElement ||
    doc.body
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
 * SelectionRange only works on a few types of input. Calling
 * `setSelectionRange` on an unsupported input type may throw an error on
 * certain browsers. To avoid it, we check if its type supports SelectionRange
 * first. It will be a noop to non-supported types until we find a workaround.
 *
 * @see
 * https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/setSelectionRange
 */
export function setSelectionRange(
  element: HTMLInputElement | HTMLTextAreaElement,
  ...args: Parameters<typeof HTMLInputElement.prototype.setSelectionRange>
) {
  if (/text|search|password|tel|url/i.test(element.type)) {
    element.setSelectionRange(...args);
  }
}

/**
 * Sort the items based on their DOM position.
 */
export function sortBasedOnDOMPosition<T>(
  items: T[],
  getElement: (item: T) => Element | null | undefined,
) {
  const pairs = items.map((item, index) => [index, item] as const);
  let isOrderDifferent = false;
  pairs.sort(([indexA, a], [indexB, b]) => {
    const elementA = getElement(a);
    const elementB = getElement(b);
    if (elementA === elementB) return 0;
    if (!elementA || !elementB) return 0;
    if (isElementPreceding(elementA, elementB)) {
      if (indexA > indexB) {
        isOrderDifferent = true;
      }
      return -1;
    }
    if (indexA < indexB) {
      isOrderDifferent = true;
    }
    return 1;
  });
  if (isOrderDifferent) {
    return pairs.map(([_, item]) => item);
  }
  return items;
}

function isElementPreceding(a: Element, b: Element) {
  return Boolean(
    b.compareDocumentPosition(a) & Node.DOCUMENT_POSITION_PRECEDING,
  );
}
