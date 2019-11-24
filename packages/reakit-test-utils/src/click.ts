import { fireEvent } from "@testing-library/react";

export function click(element: Element, options?: MouseEventInit) {
  fireEvent.mouseDown(element, options);
  fireEvent.mouseUp(element, options);
  fireEvent.click(element, options);
}
