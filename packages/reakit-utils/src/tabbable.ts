/** @module tabbable */
import { closest } from "./closest";
import { getActiveElement } from "./getActiveElement";
import { matches } from "./matches";

const selector =
  "input:not([type='hidden']):not([disabled]), select:not([disabled]), " +
  "textarea:not([disabled]), a[href], button:not([disabled]), [tabindex], " +
  "iframe, object, embed, area[href], audio[controls], video[controls], " +
  "[contenteditable]:not([contenteditable='false'])";

function isVisible(element: Element) {
  return (
    (element as HTMLElement).offsetWidth > 0 ||
    (element as HTMLElement).offsetHeight > 0 ||
    element.getClientRects().length > 0
  );
}

function hasNegativeTabIndex(element: Element) {
  const tabIndex = parseInt(element.getAttribute("tabindex") || "0", 10);
  return tabIndex < 0;
}

/**
 * Checks whether `element` is focusable or not.
 *
 * @memberof tabbable
 *
 * @example
 * import { isFocusable } from "reakit-utils";
 *
 * isFocusable(document.querySelector("input")); // true
 * isFocusable(document.querySelector("input[tabindex='-1']")); // true
 * isFocusable(document.querySelector("input[hidden]")); // false
 * isFocusable(document.querySelector("input:disabled")); // false
 */
export function isFocusable(element: Element): boolean {
  return matches(element, selector) && isVisible(element);
}

/**
 * Checks whether `element` is tabbable or not.
 *
 * @memberof tabbable
 *
 * @example
 * import { isTabbable } from "reakit-utils";
 *
 * isTabbable(document.querySelector("input")); // true
 * isTabbable(document.querySelector("input[tabindex='-1']")); // false
 * isTabbable(document.querySelector("input[hidden]")); // false
 * isTabbable(document.querySelector("input:disabled")); // false
 */
export function isTabbable(element: Element): boolean {
  return isFocusable(element) && !hasNegativeTabIndex(element);
}

/**
 * Returns all the focusable elements in `container`.
 *
 * @memberof tabbable
 *
 * @param {Element} container
 *
 * @returns {Element[]}
 */
export function getAllFocusableIn<T extends Element>(container: T) {
  const allFocusable = Array.from(container.querySelectorAll<T>(selector));
  allFocusable.unshift(container);
  return allFocusable.filter(isFocusable);
}

/**
 * Returns the first focusable element in `container`.
 *
 * @memberof tabbable
 *
 * @param {Element} container
 *
 * @returns {Element|null}
 */
export function getFirstFocusableIn<T extends Element>(container: T) {
  const allFocusable = getAllFocusableIn(container);
  return allFocusable.length ? allFocusable[0] : null;
}

/**
 * Returns all the tabbable elements in `container`, including the container
 * itself.
 *
 * @memberof tabbable
 *
 * @param {Element} container
 * @param fallbackToFocusable If `true`, it'll return focusable elements if there are no tabbable ones.
 *
 * @returns {Element[]}
 */
export function getAllTabbableIn<T extends Element>(
  container: T,
  fallbackToFocusable?: boolean
) {
  const allFocusable = Array.from(container.querySelectorAll<T>(selector));
  const allTabbable = allFocusable.filter(isTabbable);

  if (isTabbable(container)) {
    allTabbable.unshift(container);
  }

  if (!allTabbable.length && fallbackToFocusable) {
    return allFocusable;
  }
  return allTabbable;
}

/**
 * Returns the first tabbable element in `container`, including the container
 * itself if it's tabbable.
 *
 * @memberof tabbable
 *
 * @param {Element} container
 * @param fallbackToFocusable If `true`, it'll return the first focusable element if there are no tabbable ones.
 *
 * @returns {Element|null}
 */
export function getFirstTabbableIn<T extends Element>(
  container: T,
  fallbackToFocusable?: boolean
): T | null {
  const [first] = getAllTabbableIn(container, fallbackToFocusable);
  return first || null;
}

/**
 * Returns the last tabbable element in `container`, including the container
 * itself if it's tabbable.
 *
 * @memberof tabbable
 *
 * @param {Element} container
 * @param fallbackToFocusable If `true`, it'll return the last focusable element if there are no tabbable ones.
 *
 * @returns {Element|null}
 */
export function getLastTabbableIn<T extends Element>(
  container: T,
  fallbackToFocusable?: boolean
): T | null {
  const allTabbable = getAllTabbableIn(container, fallbackToFocusable);
  return allTabbable[allTabbable.length - 1] || null;
}

/**
 * Returns the next tabbable element in `container`.
 *
 * @memberof tabbable
 *
 * @param {Element} container
 * @param fallbackToFocusable If `true`, it'll return the next focusable element if there are no tabbable ones.
 *
 * @returns {Element|null}
 */
export function getNextTabbableIn<T extends Element>(
  container: T,
  fallbackToFocusable?: boolean
): T | null {
  const activeElement = getActiveElement(container);
  const allFocusable = getAllFocusableIn(container);
  const index = allFocusable.indexOf(activeElement as T);
  const slice = allFocusable.slice(index + 1);
  return (
    slice.find(isTabbable) ||
    allFocusable.find(isTabbable) ||
    (fallbackToFocusable ? slice[0] : null)
  );
}

/**
 * Returns the previous tabbable element in `container`.
 *
 * @memberof tabbable
 *
 * @param {Element} container
 * @param fallbackToFocusable If `true`, it'll return the previous focusable element if there are no tabbable ones.
 *
 * @returns {Element|null}
 */
export function getPreviousTabbableIn<T extends Element>(
  container: T,
  fallbackToFocusable?: boolean
): T | null {
  const activeElement = getActiveElement(container);
  const allFocusable = getAllFocusableIn(container).reverse();
  const index = allFocusable.indexOf(activeElement as T);
  const slice = allFocusable.slice(index + 1);
  return (
    slice.find(isTabbable) ||
    allFocusable.find(isTabbable) ||
    (fallbackToFocusable ? slice[0] : null)
  );
}

/**
 * Returns the closest focusable parent of `element`.
 *
 * @memberof tabbable
 *
 * @param {Element} container
 *
 * @returns {Element|null}
 */
export function getClosestFocusable<T extends Element>(element: T): T | null {
  let container: T | null = null;

  do {
    container = closest(element, selector);
  } while (container && !isFocusable(container));

  return container;
}

function defaultIsActive(element: Element) {
  return getActiveElement(element) === element;
}

type EnsureFocusOptions = FocusOptions & {
  isActive?: typeof defaultIsActive;
};

/**
 * Ensures `element` will receive focus if it's not already.
 *
 * @memberof tabbable
 *
 * @example
 * import { ensureFocus } from "reakit-utils";
 *
 * ensureFocus(document.activeElement); // does nothing
 *
 * const element = document.querySelector("input");
 *
 * ensureFocus(element); // focuses element
 * ensureFocus(element, { preventScroll: true }); // focuses element preventing scroll jump
 *
 * function isActive(el) {
 *   return el.dataset.active === "true";
 * }
 *
 * ensureFocus(document.querySelector("[data-active='true']"), { isActive }); // does nothing
 *
 * @returns {number} `requestAnimationFrame` call ID so it can be passed to `cancelAnimationFrame` if needed.
 */
export function ensureFocus(
  element: HTMLElement,
  { isActive = defaultIsActive, preventScroll }: EnsureFocusOptions = {}
) {
  if (isActive(element)) return -1;

  element.focus({ preventScroll });

  if (isActive(element)) return -1;

  return requestAnimationFrame(() => {
    element.focus({ preventScroll });
  });
}
