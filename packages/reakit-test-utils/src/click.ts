import { fireEvent } from "@testing-library/react";
import { isFocusable } from "reakit-utils/tabbable";
import { focus } from "./focus";

export function click(element: Element, options?: MouseEventInit) {
  fireEvent.mouseDown(element, options);

  if (isFocusable(element)) {
    focus(element);
  }

  fireEvent.mouseUp(element, options);
  fireEvent.click(element, options);
}
