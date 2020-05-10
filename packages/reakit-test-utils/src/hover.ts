import { fireEvent as domFireEvent } from "@testing-library/dom";
import { fireEvent } from "./fireEvent";
import { act } from "./act";

type DocumentWithLastHovered = Document & {
  lastHovered?: Element | null;
};

function isPointerEventsEnabled(element: Element) {
  return getComputedStyle(element).pointerEvents !== "none";
}

export function hover(element: Element, options?: MouseEventInit) {
  const document = element.ownerDocument as DocumentWithLastHovered;
  const { lastHovered } = document;
  const { disabled } = element as HTMLButtonElement;

  if (lastHovered && isPointerEventsEnabled(lastHovered)) {
    fireEvent.pointerMove(lastHovered, options);
    fireEvent.mouseMove(lastHovered, options);

    const isElementWithinLastHovered = lastHovered.contains(element);

    fireEvent.pointerOut(lastHovered, options);

    if (!isElementWithinLastHovered) {
      fireEvent.pointerLeave(lastHovered, options);
    }

    fireEvent.mouseOut(lastHovered, options);

    if (!isElementWithinLastHovered) {
      act(() => {
        // fireEvent.mouseLeave would be the same as fireEvent.mouseOut
        domFireEvent.mouseLeave(lastHovered, options);
      });
    }
  }

  if (!isPointerEventsEnabled(element)) return;

  fireEvent.pointerOver(element, options);
  fireEvent.pointerEnter(element, options);
  if (!disabled) {
    fireEvent.mouseOver(element, options);
    act(() => {
      // fireEvent.mouseEnter would be the same as fireEvent.mouseOver
      domFireEvent.mouseEnter(element, options);
    });
  }
  fireEvent.pointerMove(element, options);
  if (!disabled) {
    fireEvent.mouseMove(element, options);
  }

  document.lastHovered = element;
}
