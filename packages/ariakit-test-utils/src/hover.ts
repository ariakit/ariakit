import { fireEvent } from "./fire-event";
import { sleep } from "./sleep";

type DocumentWithLastHovered = Document & {
  lastHovered?: Element | null;
};

function isPointerEventsEnabled(element: Element) {
  return getComputedStyle(element).pointerEvents !== "none";
}

export async function hover(element: Element, options?: MouseEventInit) {
  const document = element.ownerDocument as DocumentWithLastHovered;
  const { lastHovered } = document;
  const { disabled } = element as HTMLButtonElement;
  const pointerEventsEnabled = isPointerEventsEnabled(element);

  if (lastHovered && isPointerEventsEnabled(lastHovered)) {
    fireEvent.pointerMove(lastHovered, options);
    fireEvent.mouseMove(lastHovered, options);

    const isElementWithinLastHovered = lastHovered.contains(element);

    const relatedTarget = pointerEventsEnabled ? element : null;
    const outOptions = { ...options, relatedTarget };

    fireEvent.pointerOut(lastHovered, outOptions);

    if (!isElementWithinLastHovered) {
      fireEvent.pointerLeave(lastHovered, outOptions);
    }

    fireEvent.mouseOut(lastHovered, outOptions);

    if (!isElementWithinLastHovered) {
      fireEvent.mouseLeave(lastHovered, outOptions);
    }
  }

  await sleep();

  if (!pointerEventsEnabled) return;

  const inOptions = lastHovered
    ? { relatedTarget: lastHovered, ...options }
    : options;

  fireEvent.pointerOver(element, inOptions);
  fireEvent.pointerEnter(element, inOptions);
  if (!disabled) {
    fireEvent.mouseOver(element, inOptions);
    fireEvent.mouseEnter(element, inOptions);
  }

  fireEvent.pointerMove(element, options);
  if (!disabled) {
    fireEvent.mouseMove(element, options);
  }

  document.lastHovered = element;
}
