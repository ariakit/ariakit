import { useStoreState } from "@ariakit/react-store";
import { useEffect, useState } from "react";
import { getFocusActiveElement } from "../focusable/focus-presentation.tsx";
import type { ComboboxStore } from "./combobox-store.ts";

interface ComboboxPopoverFocusOptions {
  selectElement?: HTMLElement | null;
  contentElement?: HTMLElement | null;
}

export function useComboboxPopoverFocus(
  store?: ComboboxStore | null,
  options?: ComboboxPopoverFocusOptions,
) {
  const open = useStoreState(store, "open");
  const baseElement = useStoreState(store, "baseElement");
  const inputElement = useStoreState(store, "inputElement");
  const storeSelectElement = useStoreState(store, "selectElement");
  const externalSelect = !!options;
  const selectElement = externalSelect
    ? options.selectElement
    : storeSelectElement;
  const hasSelect = externalSelect || !!selectElement;
  const selectOwnsFocus =
    !!selectElement && getFocusActiveElement(selectElement) === selectElement;
  const contentElement = options?.contentElement;
  const [lateInputFocus, setLateInputFocus] = useState<HTMLElement | null>(
    null,
  );

  useEffect(() => {
    if (!open || !externalSelect) {
      setLateInputFocus(null);
      return;
    }
    if (!inputElement || !contentElement) return;
    if (lateInputFocus) return;

    const activeElement = getFocusActiveElement(contentElement);
    if (contentElement.contains(activeElement)) {
      if (activeElement === contentElement) setLateInputFocus(inputElement);
      return;
    }

    const onFocusIn = (event: FocusEvent) => {
      const target = event.target as Node | null;
      if (!contentElement.contains(target)) return;
      contentElement.ownerDocument.removeEventListener(
        "focusin",
        onFocusIn,
        true,
      );
      if (target === contentElement) setLateInputFocus(inputElement);
    };

    contentElement.ownerDocument.addEventListener("focusin", onFocusIn, true);
    return () => {
      contentElement.ownerDocument.removeEventListener(
        "focusin",
        onFocusIn,
        true,
      );
    };
  }, [open, externalSelect, inputElement, contentElement, lateInputFocus]);

  const initialFocus = options ? lateInputFocus : inputElement;

  return {
    inputElement,
    popoverFocusProps: {
      // A callback would always be truthy, defeating the dialog's early-out
      // and scanning the whole popup for tabbable elements on every open.
      // Without an input, only take focus when the select initiated the open.
      autoFocusOnShow: hasSelect && (!!inputElement || selectOwnsFocus),
      // SelectPopover preserves its existing first-tabbable behavior unless
      // the input mounts after the popup itself has already received focus.
      initialFocus: hasSelect ? initialFocus : undefined,
      finalFocus: selectElement || baseElement,
    },
  };
}
