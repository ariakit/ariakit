import { fireEvent } from "@testing-library/react";

export function click(element: Element) {
  fireEvent.mouseDown(element);
  fireEvent.mouseUp(element);
  fireEvent.click(element);
}
