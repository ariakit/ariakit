import { addGlobalEventListener, isElement } from "@ariakit/utils";
import { useEffect, useRef } from "react";

export interface EventTargets {
  elements: Element[];
  rootTarget: EventTarget | null;
}

/**
 * Returns the full composed path for positive dialog membership and a target
 * projected into the reference element's root for outside-tree marks.
 */
export function getEventTargets(
  event: Event,
  referenceElement?: Element | null,
): EventTargets {
  const elements = event.composedPath().filter(isElement);
  if (!elements.length && isElement(event.target)) {
    elements.push(event.target);
  }
  const root = referenceElement?.getRootNode();
  return {
    elements,
    rootTarget: root
      ? elements.find((target) => target.getRootNode() === root) || event.target
      : elements[0] || event.target,
  };
}

/**
 * Stores both event-target views from the latest mousedown so opening clicks
 * and drag releases are classified from their mousedown origin.
 */
export function usePreviousMouseDownRef(
  enabled?: boolean,
  scope?: Window,
  referenceElement?: Element | null,
) {
  const previousMouseDownRef = useRef<EventTargets | null>(null);

  useEffect(() => {
    if (!enabled) {
      previousMouseDownRef.current = null;
      return;
    }
    const onMouseDown = (event: MouseEvent) => {
      previousMouseDownRef.current = getEventTargets(event, referenceElement);
    };
    return addGlobalEventListener("mousedown", onMouseDown, true, scope);
  }, [enabled, scope, referenceElement]);

  return previousMouseDownRef;
}
