import { closest } from "./closest";

/**
 * Checks whether `element` is a label targeting a native HTML radio element or not.
 *
 * @example
 * import { isLabelOfRadio } from "reakit-utils";
 *
 * isLabelOfRadio(document.querySelector("label[for='radio']")); // true
 * isLabelOfRadio(document.querySelector("label[for='email']")); // false
 *
 * @returns {boolean}
 */
export function isLabelForRadio(element: Element): element is HTMLLabelElement {
  let label = element as HTMLLabelElement;
  if (label.tagName !== "LABEL") {
    return false;
  }
  let input = document.getElementById(label.htmlFor) as HTMLInputElement | any;
  if (input) {
    return input.type === "radio";
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
