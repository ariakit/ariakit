export function setTextFieldValue(element: HTMLElement, value: string) {
  if (element.isContentEditable) {
    element.innerHTML = value;
  } else {
    (element as HTMLInputElement).value = value;
  }
}
