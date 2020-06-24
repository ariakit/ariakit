/**
 * Checks whether `element` is a native HTML radio element or not.
 *
 * @example
 * import { isRadio } from "reakit-utils";
 *
 * isRadio(document.querySelector("input[type='radio']")); // true
 * isRadio(document.querySelector("div")); // false
 *
 * @returns {boolean}
 */
export function isRadio(
  element: Element
): element is HTMLButtonElement | HTMLInputElement {
  const input = element as HTMLInputElement | any;
  return element.tagName === "INPUT" && input.type === "radio";
}
