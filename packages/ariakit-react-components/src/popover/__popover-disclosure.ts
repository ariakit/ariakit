import { useCallback, useRef } from "react";
import type { PopoverStore } from "./popover-store.ts";

export function usePopoverDisclosureRef(store: PopoverStore) {
  const ref = useRef<HTMLElement | null>(null);

  return useCallback(
    (element: HTMLElement | null) => {
      const previousElement = ref.current;
      ref.current = element;
      if (element) return;
      if (store.getState().disclosureElement !== previousElement) return;
      store.setDisclosureElement(null);
    },
    [store],
  );
}
