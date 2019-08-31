const selector =
  "input, select, textarea, a[href], button, [tabindex], audio[controls], video[controls], [contenteditable]:not([contenteditable=false])";

function isHTMLElement(element: Element): element is HTMLElement {
  return element instanceof HTMLElement;
}

function isDisabled(element: HTMLElement) {
  return Boolean((element as HTMLInputElement).disabled);
}

function hasTabIndex(element: Element) {
  return element.hasAttribute("tabindex");
}

function hasNegativeTabIndex(element: HTMLElement) {
  return hasTabIndex(element) && element.tabIndex < 0;
}

function isHidden(element: HTMLElement) {
  if (element.parentElement && isHidden(element.parentElement)) return true;
  return element.hidden;
}

function isContentEditable(element: HTMLElement) {
  const value = element.getAttribute("contenteditable");
  return value !== "false" && value != null;
}

export function isFocusable(element: Element) {
  if (!isHTMLElement(element)) return false;
  if (isHidden(element)) return false;
  if (isDisabled(element)) return false;

  const { localName } = element;
  const focusableTags = ["input", "select", "textarea", "button"];

  if (focusableTags.indexOf(localName) >= 0) return true;

  const others = {
    a: () => element.hasAttribute("href"),
    audio: () => element.hasAttribute("controls"),
    video: () => element.hasAttribute("controls")
  };

  if (localName in others) {
    return others[localName as keyof typeof others]();
  }

  if (isContentEditable(element)) return true;

  return hasTabIndex(element);
}

export function isTabbable(element: Element) {
  return (
    isHTMLElement(element) &&
    isFocusable(element) &&
    !hasNegativeTabIndex(element)
  );
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
  const allFocusable = getAllFocusableIn(container);
  const index = allFocusable.indexOf(document.activeElement as T);
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
  const allFocusable = getAllFocusableIn(container).reverse();
  const index = allFocusable.indexOf(document.activeElement as T);
  const slice = allFocusable.slice(index + 1);
  return (
    slice.find(isTabbable) ||
    allFocusable.find(isTabbable) ||
    (fallbackToFocusable ? slice[0] : null)
  );
}

export function focusNextTabbableIn<T extends Element>(
  container: T,
  fallbackToFocusable?: boolean
) {
  const nextTabbable = getNextTabbableIn(container, fallbackToFocusable);
  if (nextTabbable && isHTMLElement(nextTabbable)) {
    nextTabbable.focus();
  }
}

export function focusPreviousTabbableIn<T extends Element>(
  container: T,
  fallbackToFocusable?: boolean
) {
  const previousTabbable = getPreviousTabbableIn(
    container,
    fallbackToFocusable
  );
  if (previousTabbable && isHTMLElement(previousTabbable)) {
    previousTabbable.focus();
  }
}
