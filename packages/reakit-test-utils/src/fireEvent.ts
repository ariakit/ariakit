import { fireEvent } from "@testing-library/react";

const pointerEvents = [
  "mouseMove",
  "mouseOver",
  "mouseEnter",
  "mouseOut",
  "mouseLeave",
  "mouseDown",
  "mouseUp",
  "pointerMove",
  "pointerOver",
  "pointerEnter",
  "pointerOut",
  "pointerLeave",
  "pointerDown",
  "pointerUp",
  "click",
] as const;

// Disable pointer events when the element has pointerEvents: none
for (const event of pointerEvents) {
  const baseFireEvent = fireEvent[event];
  fireEvent[event] = (element, options) => {
    if (element instanceof Element) {
      const style = getComputedStyle(element);
      if (style.pointerEvents === "none") {
        if (element.parentElement) {
          // Recursive so we'll repeat the process the parent element also has
          // pointerEvents: none
          fireEvent[event](element.parentElement, options);
        }
        return false;
      }
    }
    return baseFireEvent(element, options);
  };
}

export { fireEvent };
