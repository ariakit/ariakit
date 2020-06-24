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
  const label = element as HTMLLabelElement;
  if (label.tagName === "LABEL") {
    const input = document.getElementById(label.htmlFor) as HTMLInputElement | any;
    if (input) {
      return input.type === "radio";
    }
  }
  const labelAsParent = closest(element, "label") as HTMLLabelElement;
  if (labelAsParent) {
    const inputInside = labelAsParent.querySelector<HTMLInputElement>("input");
    if (inputInside) {
      return inputInside.type === "radio";
    }
  }
  return false;
}
