import { addGlobalEventListener, getWindow, isElement } from "@ariakit/utils";
import { useEffect, useRef } from "react";

export interface EventTargets {
  elements: Element[];
  rootTarget: EventTarget | null;
}

/**
 * Returns an element followed by its iframe hosts up to the highest readable
 * document.
 */
export function getFrameChain(element: Element) {
  const chain = [element];
  while (true) {
    let frameElement: Element | null;
    try {
      frameElement = getWindow(element).frameElement;
    } catch {
      return chain;
    }
    if (!isElement(frameElement)) return chain;
    chain.push(frameElement);
    element = frameElement;
  }
}

/**
 * Returns the full composed path and readable iframe host chain for positive
 * dialog membership, plus a target projected into the reference element's
 * root for outside-tree marks.
 */
export function getEventTargets(
  event: Event,
  referenceElement?: Element | null,
): EventTargets {
  const elements = event.composedPath().filter(isElement);
  if (!elements.length && isElement(event.target)) {
    elements.push(event.target);
  }
  const composedTarget = elements[0];
  if (composedTarget) {
    for (const frameElement of getFrameChain(composedTarget).slice(1)) {
      if (!elements.includes(frameElement)) {
        elements.push(frameElement);
      }
    }
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
