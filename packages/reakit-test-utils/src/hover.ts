import { fireEvent as domFireEvent } from "@testing-library/dom";
import { fireEvent } from "./fireEvent";
import { act } from "./act";

export function hover(element: Element, options?: MouseEventInit) {
  const document = element.ownerDocument as Document & {
    lastHover?: Element | null;
  };
  const { lastHover } = document;
  const { disabled } = element as HTMLButtonElement;

  if (lastHover) {
    fireEvent.pointerMove(lastHover, options);
    fireEvent.mouseMove(lastHover, options);

    const withinLastHover = lastHover.contains(element);

    fireEvent.pointerOut(lastHover, options);

    if (!withinLastHover) {
      fireEvent.pointerLeave(lastHover, options);
    }

    fireEvent.mouseOut(lastHover, options);

    if (!withinLastHover) {
      act(() => {
        // fireEvent.mouseLeave would be the same as fireEvent.mouseOut
        domFireEvent.mouseLeave(lastHover, options);
      });
    }
  }

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

  document.lastHover = element;
}
