/**
 * Checks whether `element` is focusable or not.
 * @example
 * isFocusable(document.querySelector("input")); // true
 * isFocusable(document.querySelector("input[tabindex='-1']")); // true
 * isFocusable(document.querySelector("input[hidden]")); // false
 * isFocusable(document.querySelector("input:disabled")); // false
 */
export declare function isFocusable(element: Element): element is HTMLElement;
/**
 * Checks whether `element` is tabbable or not.
 * @example
 * isTabbable(document.querySelector("input")); // true
 * isTabbable(document.querySelector("input[tabindex='-1']")); // false
 * isTabbable(document.querySelector("input[hidden]")); // false
 * isTabbable(document.querySelector("input:disabled")); // false
 */
export declare function isTabbable(element: Element): element is HTMLElement;
/**
 * Returns all the focusable elements in `container`.
 */
export declare function getAllFocusableIn(container: HTMLElement, includeContainer?: boolean): HTMLElement[];
/**
 * Returns all the focusable elements in the document.
 */
export declare function getAllFocusable(includeBody?: boolean): HTMLElement[];
/**
 * Returns the first focusable element in `container`.
 */
export declare function getFirstFocusableIn(container: HTMLElement, includeContainer?: boolean): HTMLElement | null;
/**
 * Returns the first focusable element in the document.
 */
export declare function getFirstFocusable(includeBody?: boolean): HTMLElement | null;
/**
 * Returns all the tabbable elements in `container`, including the container
 * itself.
 */
export declare function getAllTabbableIn(container: HTMLElement, includeContainer?: boolean, fallbackToFocusable?: boolean): HTMLElement[];
/**
 * Returns all the tabbable elements in the document.
 */
export declare function getAllTabbable(fallbackToFocusable?: boolean): HTMLElement[];
/**
 * Returns the first tabbable element in `container`, including the container
 * itself if it's tabbable.
 */
export declare function getFirstTabbableIn(container: HTMLElement, includeContainer?: boolean, fallbackToFocusable?: boolean): HTMLElement | null;
/**
 * Returns the first tabbable element in the document.
 */
export declare function getFirstTabbable(fallbackToFocusable?: boolean): HTMLElement | null;
/**
 * Returns the last tabbable element in `container`, including the container
 * itself if it's tabbable.
 */
export declare function getLastTabbableIn(container: HTMLElement, includeContainer?: boolean, fallbackToFocusable?: boolean): HTMLElement | null;
/**
 * Returns the last tabbable element in the document.
 */
export declare function getLastTabbable(fallbackToFocusable?: boolean): HTMLElement | null;
/**
 * Returns the next tabbable element in `container`.
 */
export declare function getNextTabbableIn(container: HTMLElement, includeContainer?: boolean, fallbackToFirst?: boolean, fallbackToFocusable?: boolean): HTMLElement | null;
/**
 * Returns the next tabbable element in the document.
 */
export declare function getNextTabbable(fallbackToFirst?: boolean, fallbackToFocusable?: boolean): HTMLElement | null;
/**
 * Returns the previous tabbable element in `container`.
 *
 */
export declare function getPreviousTabbableIn(container: HTMLElement, includeContainer?: boolean, fallbackToLast?: boolean, fallbackToFocusable?: boolean): HTMLElement | null;
/**
 * Returns the previous tabbable element in the document.
 */
export declare function getPreviousTabbable(fallbackToFirst?: boolean, fallbackToFocusable?: boolean): HTMLElement | null;
/**
 * Returns the closest focusable element.
 */
export declare function getClosestFocusable(element?: HTMLElement | null): HTMLElement | null;
/**
 * Checks if `element` has focus. Elements that are referenced by
 * `aria-activedescendant` are also considered.
 * @example
 * hasFocus(document.getElementById("id"));
 */
export declare function hasFocus(element: Element): boolean;
/**
 * Checks if `element` has focus within. Elements that are referenced by
 * `aria-activedescendant` are also considered.
 * @example
 * hasFocusWithin(document.getElementById("id"));
 */
export declare function hasFocusWithin(element: Node | Element): boolean;
/**
 * Focus on an element only if it's not already focused.
 */
export declare function focusIfNeeded(element: HTMLElement): void;
/**
 * Disable focus on `element`.
 */
export declare function disableFocus(element: HTMLElement): void;
/**
 * Makes elements inside container not tabbable.
 */
export declare function disableFocusIn(container: HTMLElement, includeContainer?: boolean): void;
/**
 * Restores tabbable elements inside container that were affected by
 * disableFocusIn.
 */
export declare function restoreFocusIn(container: HTMLElement): void;
/**
 * Focus on element and scroll into view.
 */
export declare function focusIntoView(element: HTMLElement, options?: ScrollIntoViewOptions): void;
