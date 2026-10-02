import { useEvent } from "@ariakit/react-utils";
import { isFalsyBooleanCallback } from "@ariakit/utils";
import type { BooleanOrCallback } from "@ariakit/utils";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { useRef } from "react";

type EscapeEvent = KeyboardEvent | ReactKeyboardEvent;

export interface UseEscapeCloseParams {
  hideOnEscape: BooleanOrCallback<EscapeEvent>;
  onClose?: (event: Event) => void;
  onEscapeClose: () => void;
}

/**
 * Wraps the `hideOnEscape` and `onClose` props of a dialog to call
 * `onEscapeClose` once a close that Escape requested goes through. The
 * `hideOnEscape` wrapper only decides whether Escape closes the dialog, so the
 * work that follows a close doesn't run when `onClose` prevents it.
 * https://github.com/ariakit/ariakit/issues/7622
 */
export function useEscapeClose({
  hideOnEscape,
  onClose,
  onEscapeClose,
}: UseEscapeCloseParams) {
  const acceptedEscapeRef = useRef<object | null>(null);

  const hideOnEscapeWrapper = useEvent((event: EscapeEvent) => {
    if (isFalsyBooleanCallback(hideOnEscape, event)) return false;
    const acceptedEscape = {};
    acceptedEscapeRef.current = acceptedEscape;
    // Browsers may run microtasks between the listeners that accept and commit
    // the key press, so the marker lasts until the next task.
    setTimeout(() => {
      if (acceptedEscapeRef.current !== acceptedEscape) return;
      acceptedEscapeRef.current = null;
    });
    return true;
  });

  const onCloseWrapper = useEvent((event: Event) => {
    const acceptedEscape = acceptedEscapeRef.current;
    acceptedEscapeRef.current = null;
    onClose?.(event);
    if (event.defaultPrevented) return;
    if (!acceptedEscape) return;
    onEscapeClose();
  });

  return { hideOnEscape: hideOnEscapeWrapper, onClose: onCloseWrapper };
}
