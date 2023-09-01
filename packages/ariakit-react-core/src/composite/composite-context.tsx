import { createContext } from "react";
import {
  CollectionContextProvider,
  CollectionScopedContextProvider,
} from "../collection/collection-context.js";
import { createStoreContext } from "../utils/system.js";
import type { CompositeStore } from "./composite-store.js";

const ctx = createStoreContext<CompositeStore>(
  [CollectionContextProvider],
  [CollectionScopedContextProvider],
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
export const useCompositeContext = ctx.useStoreContext;

export const useCompositeScopedContext = ctx.useScopedStoreContext;

export const useCompositeProviderContext = ctx.useStoreProviderContext;

export const CompositeContextProvider = ctx.StoreContextProvider;

export const CompositeScopedContextProvider = ctx.StoreScopedContextProvider;

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
