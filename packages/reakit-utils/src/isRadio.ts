/**
 * Checks whether `element` is a native HTML radio element or not.
 *
 * @example
 * import { isRadio } from "reakit-utils";
 *
 * isButton(document.querySelector("input[type='radio']")); // true
 * isButton(document.querySelector("div")); // false
 *
 * @returns {boolean}
 */
export function isRadio(
  element: Element
): element is HTMLButtonElement | HTMLInputElement {
  if (element.tagName === "INPUT") {
    const input = element as HTMLInputElement;
    return input.type === "radio";
  }

  return false;
}
