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

// A form exposes its listed controls as named properties that override
// built-ins, and a document does the same for the elements it names, so a
// member read on either can answer with an element instead of the value the
// interface declares. Where the helper can tell from the value that it got an
// element, it does, and answers safely rather than accurately. An accessor is
// reserved for the reads where that is impossible.
// https://github.com/ariakit/ariakit/issues/7201

// The two accessors below sit at different prototype depths, and the depths
// differ per DOM implementation, so walk the chain rather than read one
// prototype. Resolved from the live document because `canUseDOM` does not prove
// the `Node` and `Document` globals exist.
function lookupGetter(prototype: object, name: string) {
  let target: object | null = prototype;
  while (target) {
    const descriptor = Object.getOwnPropertyDescriptor(target, name);
    // oxlint-disable-next-line typescript/unbound-method -- the receiver is supplied explicitly at every call site
    if (descriptor?.get) return descriptor.get;
    target = Object.getPrototypeOf(target);
  }
  return undefined;
}

// The read that would do the checking is the one a named element answers, so a
// document naming an element `nodeType` would be rejected as a document and
// every element in that frame would resolve to the ambient realm.
// https://github.com/ariakit/ariakit/pull/7213#discussion_r3816584472
const nodeTypeGetter = canUseDOM
  ? lookupGetter(Object.getPrototypeOf(window.document), "nodeType")
  : undefined;

// A named form and the focused element are both elements, so no value tells
// them apart, and the wrong answer is silent rather than a throw the developer
// can act on. Other collisions are the application's to fix, by giving the
// control a different `name` and `id`, since a form matches on either.
// https://github.com/ariakit/ariakit/issues/7228#issuecomment-5359605589
const activeElementGetter = canUseDOM
  ? lookupGetter(Object.getPrototypeOf(window.document), "activeElement")
  : undefined;

// Typed the way `document.defaultView` is, because the interfaces a caller
// reads off a window, such as `PointerEvent`, are globals rather than members
// of `Window`.
function isWindow(value: unknown): value is Window & typeof globalThis {
  if (!value) return false;
  // A window is the only object that is its own `window`.
  return (value as Window).window === value;
}

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
  // and that check reads no member a named element can answer.
  if (isWindow(defaultView) && ownsDocument(defaultView, nodeDocument)) {
    return defaultView;
  }
  return window;
}

export interface GetActiveElementOptions {
  /**
   * Whether to resolve focus that lives inside a frame into that frame's own
   * document. Pass `false` to decide ownership in `node`'s document, where
   * focus inside a frame is represented by the frame element.
   * @default true
   */
  frame?: boolean;
  /**
   * Whether to resolve the element referenced by the focused element's
   * `aria-activedescendant` attribute.
   * @default false
   */
  activeDescendant?: boolean;
}

/**
 * Returns the focused element for `node`'s document, resolving into a focused
 * frame's own document unless `frame` is `false`.
 * @example
 * // Focus inside a frame, as the frame element rather than the inner element.
 * getActiveElement(document.getElementById("dialog"), { frame: false });
 */
export function getActiveElement(
  node?: Node | null,
  { frame = true, activeDescendant = false }: GetActiveElementOptions = {},
): HTMLElement | null {
  const ownerDocument = getDocument(node);
  const activeElement = activeElementGetter
    ? (activeElementGetter.call(ownerDocument) as Element | null)
    : ownerDocument.activeElement;
  if (!activeElement?.nodeName) {
    // In IE11, activeElement might be an empty object if we're interacting
    // with elements inside of an iframe.
    return null;
  }
  if (frame && isFrame(activeElement) && activeElement.contentDocument?.body) {
    return getActiveElement(activeElement.contentDocument.body, {
      frame,
      activeDescendant,
    });
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
  // Reading `nodeType` on a non-node target yields `undefined`. The numeric
  // literal (Node.ELEMENT_NODE === 1) avoids referencing the `Node` global, so
  // the guard stays safe even if it's ever evaluated during SSR.
  return (target as Node | null)?.nodeType === 1;
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
  return typeof (target as Node | null)?.nodeType === "number";
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
 * Checks whether a collection role should expose `aria-multiselectable`.
 */
export function supportsAriaMultiselectable(role?: AriaRole | null) {
  if (role === "grid") return true;
  if (role === "listbox") return true;
  if (role === "tree") return true;
  if (role === "treegrid") return true;
  return false;
}

/**
 * Returns the ARIA attribute that represents selection for the given role.
 */
export function getSelectionAttributeByRole(role?: AriaRole | null) {
  if (role === "checkbox") return "aria-checked";
  if (role === "menuitemcheckbox") return "aria-checked";
  if (role === "menuitemradio") return "aria-checked";
  if (role === "radio") return "aria-checked";
  if (role === "switch") return "aria-checked";
  if (role === "columnheader") return "aria-selected";
  if (role === "gridcell") return "aria-selected";
  if (role === "option") return "aria-selected";
  if (role === "row") return "aria-selected";
  if (role === "rowheader") return "aria-selected";
  if (role === "tab") return "aria-selected";
  if (role === "treeitem") return "aria-selected";
  return undefined;
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
