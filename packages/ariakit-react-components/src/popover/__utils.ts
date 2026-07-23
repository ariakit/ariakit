import { useCallback, useRef } from "react";
import type { PopoverStore } from "./popover-store.ts";
import type { PopoverStoreState } from "./popover-store.ts";

export type Placement = PopoverStoreState["placement"];

type BasePlacementOf<T extends string> = T extends `${infer Base}-${string}`
  ? Base
  : T;

export type BasePlacement = BasePlacementOf<Placement>;

export function getBasePlacement(placement: Placement) {
  // Every Placement union member starts with its base side.
  return placement.split("-")[0] as BasePlacement;
}

/**
 * Returns an ownership-aware ref callback that clears a detached disclosure
 * element while leaving generic Disclosure lifecycle behavior unchanged.
 *
 * PopoverDisclosure and ComboboxDisclosure share this cleanup because their
 * disclosure elements can provide fallback positioning geometry.
 */
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
