import {
  getActiveElement,
  contains,
  closest,
  matches,
  isFrame,
  isVisible,
} from "./dom";

const selector =
  "input:not([type='hidden']):not([disabled]), select:not([disabled]), " +
  "textarea:not([disabled]), a[href], button:not([disabled]), [tabindex], " +
  "iframe, object, embed, area[href], audio[controls], video[controls], " +
  "[contenteditable]:not([contenteditable='false'])";

function hasNegativeTabIndex(element: Element) {
  const tabIndex = parseInt(element.getAttribute("tabindex") || "0", 10);
  return tabIndex < 0;
}

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
export function isFocusable(element: Element): element is HTMLElement {
  return matches(element, selector) && isVisible(element);
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
export function isTabbable(element: Element): element is HTMLElement {
  return isFocusable(element) && !hasNegativeTabIndex(element);
}

/**
 * Returns all the focusable elements in `container`.
 */
export function getAllFocusableIn(
  container: HTMLElement,
  includeContainer?: boolean
) {
  const elements = Array.from(
    container.querySelectorAll<HTMLElement>(selector)
  );
  if (includeContainer) {
    elements.unshift(container);
  }

  const focusableElements = elements.filter(isFocusable);

  focusableElements.forEach((element, i) => {
    if (isFrame(element) && element.contentDocument) {
      const frameBody = element.contentDocument.body;
      focusableElements.splice(i, 1, ...getAllFocusableIn(frameBody));
    }
  });

  return focusableElements;
}

/**
 * Returns all the focusable elements in the document.
 */
export function getAllFocusable(includeBody?: boolean) {
  return getAllFocusableIn(document.body, includeBody);
}

/**
 * Returns the first focusable element in `container`.
 */
export function getFirstFocusableIn(
  container: HTMLElement,
  includeContainer?: boolean
) {
  const [first] = getAllFocusableIn(container, includeContainer);
  return first || null;
}

/**
 * Returns the first focusable element in the document.
 */
export function getFirstFocusable(includeBody?: boolean) {
  return getFirstFocusableIn(document.body, includeBody);
}

/**
 * Returns all the tabbable elements in `container`, including the container
 * itself.
 */
export function getAllTabbableIn(
  container: HTMLElement,
  includeContainer?: boolean,
  fallbackToFocusable?: boolean
) {
  const elements = Array.from(
    container.querySelectorAll<HTMLElement>(selector)
  );
  const tabbableElements = elements.filter(isTabbable);

  if (includeContainer && isTabbable(container)) {
    tabbableElements.unshift(container);
  }

  tabbableElements.forEach((element, i) => {
    if (isFrame(element) && element.contentDocument) {
      const frameBody = element.contentDocument.body;
      const allFrameTabbable = getAllTabbableIn(
        frameBody,
        false,
        fallbackToFocusable
      );
      tabbableElements.splice(i, 1, ...allFrameTabbable);
    }
  });

  if (!tabbableElements.length && fallbackToFocusable) {
    return elements;
  }
  return tabbableElements;
}

/**
 * Returns all the tabbable elements in the document.
 */
export function getAllTabbable(fallbackToFocusable?: boolean) {
  return getAllTabbableIn(document.body, false, fallbackToFocusable);
}

/**
 * Returns the first tabbable element in `container`, including the container
 * itself if it's tabbable.
 */
export function getFirstTabbableIn(
  container: HTMLElement,
  includeContainer?: boolean,
  fallbackToFocusable?: boolean
) {
  const [first] = getAllTabbableIn(
    container,
    includeContainer,
    fallbackToFocusable
  );
  return first || null;
}

/**
 * Returns the first tabbable element in the document.
 */
export function getFirstTabbable(fallbackToFocusable?: boolean) {
  return getFirstTabbableIn(document.body, false, fallbackToFocusable);
}

/**
 * Returns the last tabbable element in `container`, including the container
 * itself if it's tabbable.
 */
export function getLastTabbableIn(
  container: HTMLElement,
  includeContainer?: boolean,
  fallbackToFocusable?: boolean
) {
  const allTabbable = getAllTabbableIn(
    container,
    includeContainer,
    fallbackToFocusable
  );
  return allTabbable[allTabbable.length - 1] || null;
}

/**
 * Returns the last tabbable element in the document.
 */
export function getLastTabbable(fallbackToFocusable?: boolean) {
  return getLastTabbableIn(document.body, false, fallbackToFocusable);
}

/**
 * Returns the next tabbable element in `container`.
 */
export function getNextTabbableIn(
  container: HTMLElement,
  includeContainer?: boolean,
  fallbackToFirst?: boolean,
  fallbackToFocusable?: boolean
) {
  const activeElement = getActiveElement(container);
  const allFocusable = getAllFocusableIn(container, includeContainer);
  const activeIndex = allFocusable.indexOf(activeElement as HTMLElement);
  const nextFocusableElements = allFocusable.slice(activeIndex + 1);
  return (
    nextFocusableElements.find(isTabbable) ||
    (fallbackToFirst ? allFocusable.find(isTabbable) : null) ||
    (fallbackToFocusable ? nextFocusableElements[0] : null) ||
    null
  );
}

/**
 * Returns the next tabbable element in the document.
 */
export function getNextTabbable(
  fallbackToFirst?: boolean,
  fallbackToFocusable?: boolean
) {
  return getNextTabbableIn(
    document.body,
    false,
    fallbackToFirst,
    fallbackToFocusable
  );
}

/**
 * Returns the previous tabbable element in `container`.
 *
 */
export function getPreviousTabbableIn(
  container: HTMLElement,
  includeContainer?: boolean,
  fallbackToLast?: boolean,
  fallbackToFocusable?: boolean
) {
  const activeElement = getActiveElement(container);
  const allFocusable = getAllFocusableIn(container, includeContainer).reverse();
  const activeIndex = allFocusable.indexOf(activeElement as HTMLElement);
  const previousFocusableElements = allFocusable.slice(activeIndex + 1);
  return (
    previousFocusableElements.find(isTabbable) ||
    (fallbackToLast ? allFocusable.find(isTabbable) : null) ||
    (fallbackToFocusable ? previousFocusableElements[0] : null) ||
    null
  );
}

/**
 * Returns the previous tabbable element in the document.
 */
export function getPreviousTabbable(
  fallbackToFirst?: boolean,
  fallbackToFocusable?: boolean
) {
  return getPreviousTabbableIn(
    document.body,
    false,
    fallbackToFirst,
    fallbackToFocusable
  );
}

/**
 * Returns the closest focusable element.
 */
export function getClosestFocusable(element?: HTMLElement | null) {
  while (element && !isFocusable(element)) {
    element = closest<HTMLElement>(element, selector);
  }
  return element || null;
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
export function hasFocus(element: Element) {
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
export function hasFocusWithin(element: Node | Element) {
  const activeElement = getActiveElement(element);
  if (!activeElement) return false;
  if (contains(element, activeElement)) return true;
  const activeDescendant = activeElement.getAttribute("aria-activedescendant");
  if (!activeDescendant) return false;
  if (!("id" in element)) return false;
  if (activeDescendant === element.id) return true;
  return !!element.querySelector(`#${CSS.escape(activeDescendant)}`);
}

/**
 * Disable focus on `element`.
 */
export function disableFocus(element: HTMLElement) {
  const currentTabindex = element.getAttribute("tabindex") ?? "";
  element.setAttribute("data-tabindex", currentTabindex);
  element.setAttribute("tabindex", "-1");
}

/**
 * Makes elements inside container not tabbable.
 */
export function disableFocusIn(
  container: HTMLElement,
  includeContainer?: boolean
) {
  const tabbableElements = getAllTabbableIn(container, includeContainer);
  tabbableElements.forEach(disableFocus);
}

/**
 * Restores tabbable elements inside container that were affected by
 * disableFocusIn.
 */
export function restoreFocusIn(container: HTMLElement) {
  const elements = container.querySelectorAll<HTMLElement>("[data-tabindex]");
  // TODO: This is a workaround for: open portaled menu with enter, press
  // shift+tab to focus the menu button, then press arrow up to focus the last
  // item, then press shift+tab to focus the menu button again. Without this,
  // the previously focused menu item will receive focus on shift+tab. We need
  // to make this more generic.
  const hasTabbableElement = !!getFirstTabbableIn(container, true);
  const restoreTabIndex = (element: HTMLElement) => {
    const tabindex = element.getAttribute("data-tabindex");
    const isFocusTrap = element.hasAttribute("data-focus-trap");
    element.removeAttribute("data-tabindex");
    if (tabindex && (!hasTabbableElement || isFocusTrap)) {
      element.setAttribute("tabindex", tabindex);
    } else {
      element.removeAttribute("tabindex");
    }
  };
  if (container.hasAttribute("data-tabindex")) {
    restoreTabIndex(container);
  }
  elements.forEach(restoreTabIndex);
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
  // TODO: Try to use queueMicrotask before requestAnimationFrame and dispatch
  // focus events if the element is not focusable?
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
