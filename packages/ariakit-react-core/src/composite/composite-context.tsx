import { createContext, useContext } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { CollectionContextProvider } from "../collection/collection-context.js";
import type { CompositeStore } from "./composite-store.js";

export const CompositeContext = createContext<CompositeStore | undefined>(
  undefined,
);

/**
 * Returns the composite store from the nearest composite container.
 * @example
 * function CompositeItem() {
 *   const store = useCompositeContext();
 *
 *   if (!store) {
 *     throw new Error("CompositeItem must be wrapped in CompositeProvider");
 *   }
 *
 *   // Use the store...
 * }
 */
export function useCompositeContext() {
  return useContext(CompositeContext);
}

export function CompositeContextProvider(
  props: ComponentPropsWithoutRef<typeof CompositeContext.Provider>,
) {
  return (
    <CollectionContextProvider {...props}>
      <CompositeContext.Provider {...props} />
    </CollectionContextProvider>
  );
}

interface ItemContext {
  baseElement?: HTMLElement;
  id?: string;
}

export const CompositeItemContext = createContext<ItemContext | undefined>(
  undefined,
);

interface RowContext extends ItemContext {
  ariaSetSize?: number;
  ariaPosInSet?: number;
}

export const CompositeRowContext = createContext<RowContext | undefined>(
  undefined,
);
