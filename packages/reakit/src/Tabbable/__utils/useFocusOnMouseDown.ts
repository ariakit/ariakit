import * as React from "react";
import { isButton } from "reakit-utils/isButton";
import { hasFocusWithin } from "reakit-utils/hasFocusWithin";
import { getActiveElement } from "reakit-utils/getActiveElement";
import { useIsomorphicEffect } from "reakit-utils/useIsomorphicEffect";

export function useFocusOnMouseDown() {
  const [element, setElement] = React.useState<HTMLElement | null>(null);

  const onMouseDown = React.useCallback(
    (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
      const self = event.currentTarget;
      if (!isButton(self)) return;
      setElement(event.currentTarget);
    },
    []
  );

  useIsomorphicEffect(() => {
    if (!element) return undefined;
    // Safari and Firefox on MacOS don't focus on the button on mouse down,
    // like other browsers/platforms. Instead, they focus on the closest
    // focusable parent element (ultimately, the body element). So we make
    // sure to give focus to the button on mouse down.
    const id = window.requestAnimationFrame(() => {
      const activeElement = getActiveElement(element);
      if (!hasFocusWithin(element) && activeElement?.contains(element)) {
        element.focus();
      }
      setElement(null);
    });
    return () => window.cancelAnimationFrame(id);
  }, [element]);

  return onMouseDown;
}
