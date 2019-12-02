import { closest } from "./closest";

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
  const tabIndex = parseInt(element.getAttribute("tabIndex") || "0", 10);
  return tabIndex < 0;
}

export function isFocusable(element: Element) {
  return element.matches(selector) && isVisible(element);
}

export function isTabbable(element: Element) {
  return isFocusable(element) && !hasNegativeTabIndex(element);
}

export function getAllFocusableIn<T extends Element>(container: T) {
  const allFocusable = Array.from(container.querySelectorAll<T>(selector));
  allFocusable.unshift(container);
  return allFocusable.filter(isFocusable);
}

export function getFirstFocusableIn<T extends Element>(container: T) {
  const allFocusable = getAllFocusableIn(container);
  return allFocusable.length ? allFocusable[0] : null;
}

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

export function getFirstTabbableIn<T extends Element>(
  container: T,
  fallbackToFocusable?: boolean
): T | null {
  const [first] = getAllTabbableIn(container, fallbackToFocusable);
  return first || null;
}

export function getLastTabbableIn<T extends Element>(
  container: T,
  fallbackToFocusable?: boolean
): T | null {
  const allTabbable = getAllTabbableIn(container, fallbackToFocusable);
  return allTabbable[allTabbable.length - 1] || null;
}

export function getNextTabbableIn<T extends Element>(
  container: T,
  fallbackToFocusable?: boolean
): T | null {
  const { activeElement } = container.ownerDocument || document;
  const allFocusable = getAllFocusableIn(container);
  const index = allFocusable.indexOf(activeElement as T);
  const slice = allFocusable.slice(index + 1);
  return (
    slice.find(isTabbable) ||
    allFocusable.find(isTabbable) ||
    (fallbackToFocusable ? slice[0] : null)
  );
}

export function getPreviousTabbableIn<T extends Element>(
  container: T,
  fallbackToFocusable?: boolean
): T | null {
  const { activeElement } = container.ownerDocument || document;
  const allFocusable = getAllFocusableIn(container).reverse();
  const index = allFocusable.indexOf(activeElement as T);
  const slice = allFocusable.slice(index + 1);
  return (
    slice.find(isTabbable) ||
    allFocusable.find(isTabbable) ||
    (fallbackToFocusable ? slice[0] : null)
  );
}

export function getClosestFocusable<T extends Element>(element: T): T | null {
  let container: T | null = null;

  do {
    container = closest(element, selector);
  } while (container && !isFocusable(container));

  return container;
}

function defaultIsActive(element: Element) {
  const { activeElement } = element.ownerDocument || document;
  return activeElement === element;
}

type EnsureFocusOptions = FocusOptions & {
  isActive?: typeof defaultIsActive;
};

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
