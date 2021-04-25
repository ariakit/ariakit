import { getActiveElement, contains, closest, matches } from "./dom";

const selector =
  "input:not([type='hidden']):not([disabled]), select:not([disabled]), " +
  "textarea:not([disabled]), a[href], button:not([disabled]), [tabindex], " +
  "iframe, object, embed, area[href], audio[controls], video[controls], " +
  "[contenteditable]:not([contenteditable='false'])";

/**
 * Checks whether `element` is focusable or not.
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

function isVisible(element: Element) {
  const htmlElement = element as HTMLElement;
  return (
    htmlElement.offsetWidth > 0 ||
    htmlElement.offsetHeight > 0 ||
    element.getClientRects().length > 0
  );
}

/**
 * Checks whether `element` is tabbable or not.
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

function hasNegativeTabIndex(element: Element) {
  const tabIndex = parseInt(element.getAttribute("tabindex") || "0", 10);
  return tabIndex < 0;
}

/**
 * Returns all the focusable elements in `container`.
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
 * @param {Element} container
 *
 * @returns {Element|null}
 */
export function getFirstFocusableIn<T extends Element>(container: T) {
  const [first] = getAllFocusableIn(container);
  return first || null;
}

/**
 * Returns all the tabbable elements in `container`, including the container
 * itself.
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
 * Returns the closest focusable element.
 *
 * @param {Element} container
 *
 * @returns {Element|null}
 */
export function getClosestFocusable<T extends Element>(
  element?: T | null
): T | null | undefined {
  while (element && !isFocusable(element)) {
    element = closest(element, selector) as T;
  }
  return element;
}

/**
 * Checks if `element` has focus. Elements that are referenced by
 * `aria-activedescendant` are also considered.
 *
 * @example
 * import { hasFocus } from "reakit-utils";
 *
 * hasFocus(document.getElementById("id"));
 */
export function hasFocus(element: Element): boolean {
  const activeElement = getActiveElement(element);
  if (!activeElement) return false;
  if (activeElement === element) return true;
  const activeDescendant = activeElement.getAttribute("aria-activedescendant");
  if (!activeDescendant) return false;
  return activeDescendant === element.id;
}

/**
 * Checks if `element` has focus within. Elements that are referenced by
 * `aria-activedescendant` are also considered.
 *
 * @example
 * import { hasFocusWithin } from "reakit-utils";
 *
 * hasFocusWithin(document.getElementById("id"));
 */
export function hasFocusWithin(element: Element): boolean {
  const activeElement = getActiveElement(element);
  if (!activeElement) return false;
  if (contains(element, activeElement)) return true;
  const activeDescendant = activeElement.getAttribute("aria-activedescendant");
  if (!activeDescendant) return false;
  if (activeDescendant === element.id) return true;
  return !!element.querySelector(`#${activeDescendant}`);
}

/**
 * Ensures `element` will receive focus if it's not already.
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
  { preventScroll, isActive = hasFocus }: EnsureFocusOptions = {}
) {
  if (isActive(element)) return -1;

  element.focus({ preventScroll });

  if (isActive(element)) return -1;

  return requestAnimationFrame(() => {
    element.focus({ preventScroll });
  });
}

type EnsureFocusOptions = FocusOptions & {
  isActive?: typeof hasFocus;
};
