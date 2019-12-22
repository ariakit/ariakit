const buttonInputTypes = [
  "button",
  "color",
  "file",
  "image",
  "reset",
  "submit"
];

export function isButton(
  element: Element
): element is HTMLButtonElement | HTMLInputElement {
  if (element.tagName === "BUTTON") return true;
  if (element.tagName === "INPUT") {
    const input = element as HTMLInputElement;
    return buttonInputTypes.indexOf(input.type) !== -1;
  }

  return false;
}
