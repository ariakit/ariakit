import { getActiveElement } from "reakit-utils/getActiveElement";

const isIE11 = typeof window !== "undefined" && "msCrypto" in window;

export function getNextActiveElementOnBlur(event: React.FocusEvent) {
  // IE 11 doesn't support event.relatedTarget on blur.
  // document.activeElement points the the next active element.
  // On modern browsers, document.activeElement points to the current target.
  if (isIE11) {
    const activeElement = getActiveElement(event.target);
    return activeElement as HTMLElement | null;
  }
  return event.relatedTarget as HTMLElement | null;
}
