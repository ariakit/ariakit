import {
  closest,
  contains,
  getActiveElement,
  isFrame,
  isVisible,
  matches,
} from "./dom.js";

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
 * @example
 * isFocusable(document.querySelector("input")); // true
 * isFocusable(document.querySelector("input[tabindex='-1']")); // true
 * isFocusable(document.querySelector("input[hidden]")); // false
 * isFocusable(document.querySelector("input:disabled")); // false
 */
export function isFocusable(element: Element): element is HTMLElement {
  if (!matches(element, selector)) return false;
  if (!isVisible(element)) return false;
  if (closest(element, "[inert]")) return false;
  return true;
}

/**
 * Checks whether `element` is tabbable or not.
 * @example
 * isTabbable(document.querySelector("input")); // true
 * isTabbable(document.querySelector("input[tabindex='-1']")); // false
 * isTabbable(document.querySelector("input[hidden]")); // false
 * isTabbable(document.querySelector("input:disabled")); // false
 */
export function isTabbable(
  element: Element | HTMLElement | HTMLInputElement
): element is HTMLElement {
  if (!isFocusable(element)) return false;
  if (hasNegativeTabIndex(element)) return false;
  // If the element is a radio button in a form, we must take roving tabindex
  // into account.
  if (!("form" in element)) return true;
  if (!element.form) return true;
  if (element.checked) return true;
  if (element.type !== "radio") return true;
  // If the radio button is not part of a radio group, it's tabbable.
  const radioGroup = element.form.elements.namedItem(element.name);
  if (!radioGroup) return true;
  if (!("length" in radioGroup)) return true;
  // If we are in a radio group, we must check if the active element is part of
  // the same group, which would make all the other radio buttons in the group
  // non-tabbable.
  const activeElement = getActiveElement(element) as
    | HTMLElement
    | HTMLInputElement
    | null;
  if (!activeElement) return true;
  if (activeElement === element) return true;
  if (!("form" in activeElement)) return true;
  if (activeElement.form !== element.form) return true;
  if (activeElement.name !== element.name) return true;
  return false;
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
 * @example
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
 * @example
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
 * Focus on an element only if it's not already focused.
 */
export function focusIfNeeded(element: HTMLElement) {
  if (!hasFocusWithin(element) && isFocusable(element)) {
    element.focus();
  }
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
  const restoreTabIndex = (element: HTMLElement) => {
    const tabindex = element.getAttribute("data-tabindex");
    element.removeAttribute("data-tabindex");
    if (tabindex) {
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
 * Focus on element and scroll into view.
 */
export function focusIntoView(
  element: HTMLElement,
  options?: ScrollIntoViewOptions
) {
  if (!("scrollIntoView" in element)) {
    // @ts-ignore
    element.focus();
  } else {
    element.focus({ preventScroll: true });
    element.scrollIntoView({ block: "nearest", inline: "nearest", ...options });
  }
}
