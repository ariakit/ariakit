import { AriaAttributes, AriaRole } from "./aria-types";
/**
 * It's `true` if it is running in a browser environment or `false` if it is not
 * (SSR).
 * @example
 * const title = canUseDOM ? document.title : "";
 */
export declare const canUseDOM: boolean;
/**
 * Returns `element.ownerDocument || document`.
 */
export declare function getDocument(node?: Node | null): Document;
/**
 * Returns `element.ownerDocument.defaultView || window`.
 */
export declare function getWindow(node?: Node | null): Window;
/**
 * Returns `element.ownerDocument.activeElement`.
 */
export declare function getActiveElement(node?: Node | null, activeDescendant?: boolean): HTMLElement | null;
/**
 * Similar to `Element.prototype.contains`, but a little bit faster when
 * `element` is the same as `child`.
 * @example
 * contains(
 *   document.getElementById("parent"),
 *   document.getElementById("child")
 * );
 */
export declare function contains(parent: Node, child: Node): boolean;
/**
 * Checks whether `element` is a frame element.
 */
export declare function isFrame(element: Element): element is HTMLIFrameElement;
/**
 * Checks whether `element` is a native HTML button element.
 * @example
 * isButton(document.querySelector("button")); // true
 * isButton(document.querySelector("input[type='button']")); // true
 * isButton(document.querySelector("div")); // false
 * isButton(document.querySelector("input[type='text']")); // false
 * isButton(document.querySelector("div[role='button']")); // false
 */
export declare function isButton(element: {
    tagName: string;
    type?: string;
}): boolean;
/**
 * Ponyfill for `Element.prototype.matches`
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/matches
 */
export declare function matches(element: Element, selectors: string): boolean;
/**
 * Checks if the element is visible or not.
 */
export declare function isVisible(element: Element): boolean;
/**
 * Ponyfill for `Element.prototype.closest`
 * @example
 * closest(document.getElementById("id"), "div");
 * // same as
 * document.getElementById("id").closest("div");
 */
export declare function closest<K extends keyof HTMLElementTagNameMap>(element: Element, selectors: K): HTMLElementTagNameMap[K];
export declare function closest<K extends keyof SVGElementTagNameMap>(element: Element, selectors: K): SVGElementTagNameMap[K];
export declare function closest<T extends Element = Element>(element: Element, selectors: string): T | null;
/**
 * Check whether the given element is a text field, where text field is defined
 * by the ability to select within the input.
 * @example
 * isTextField(document.querySelector("div")); // false
 * isTextField(document.querySelector("input")); // true
 * isTextField(document.querySelector("input[type='button']")); // false
 * isTextField(document.querySelector("textarea")); // true
 */
export declare function isTextField(element: Element): element is HTMLInputElement | HTMLTextAreaElement;
/**
 * Returns the element's role attribute, if it has one.
 */
export declare function getPopupRole(element?: Element | null, fallback?: AriaAttributes["aria-haspopup"]): boolean | "grid" | "listbox" | "menu" | "tree" | "dialog" | "true" | "false" | undefined;
/**
 * Returns the item role attribute based on the popup's role.
 */
export declare function getPopupItemRole(element?: Element | null, fallback?: AriaRole): string | undefined;
/**
 * Returns the start and end offsets of the selection in the element.
 */
export declare function getTextboxSelection(element: HTMLElement): {
    start: number;
    end: number;
};
/**
 * Calls `element.scrollIntoView()` if the element is hidden or partly hidden in
 * the viewport.
 */
export declare function scrollIntoViewIfNeeded(element: Element, arg?: boolean | ScrollIntoViewOptions): void;
/**
 * Returns the scrolling container element of a given element.
 */
export declare function getScrollingElement(element?: Element | null): HTMLElement | Element | null;
/**
 * Determines whether an element is hidden or partially hidden in the viewport.
 */
export declare function isPartiallyHidden(element: Element): boolean;
