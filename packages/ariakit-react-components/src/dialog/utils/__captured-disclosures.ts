// Elements a dialog captured because nothing named an opener. They stand for
// nothing the application asked for, so a later open may replace them. Tracked
// on the element rather than per dialog or per store, because both the dialog
// and the store it derives are replaced when its component remounts, while the
// store the application owns keeps the value. A mark is never dropped, since
// two dialogs can share an element and one clearing it would leave the other
// reading its own fallback as a name.
// https://github.com/ariakit/ariakit/issues/7095
const capturedDisclosures = new WeakSet<Element>();

export function captureDisclosure(element: Element) {
  capturedDisclosures.add(element);
}

/**
 * Whether a dialog captured this element as a fallback opener rather than the
 * application naming one. A captured element only happened to have focus, so it
 * can't be assumed to close the dialog the way a disclosure does.
 */
export function isCapturedDisclosure(element: Element) {
  return capturedDisclosures.has(element);
}
