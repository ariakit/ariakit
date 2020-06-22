import { closest } from "./closest";

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
  let input = element as HTMLInputElement | any;
  if (element.tagName === "INPUT") {
    return input.type === "radio";
  }
  let label = element as HTMLLabelElement;
  if (element.tagName === "LABEL") {
    input = document.getElementById(label.htmlFor);
    if (input) {
      return input.type === "radio";
    }
  }
  label = closest(element, "label");
  if (label) {
    input = label.querySelector<HTMLInputElement>("input");
    if (input) {
      return input.type === "radio";
    }
  }
  return false;
}
