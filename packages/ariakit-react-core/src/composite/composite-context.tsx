"use client";
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
export const useCompositeContext = ctx.useContext;

export const useCompositeScopedContext = ctx.useScopedContext;

export const useCompositeProviderContext = ctx.useProviderContext;

export const CompositeContextProvider = ctx.ContextProvider;

export const CompositeScopedContextProvider = ctx.ScopedContextProvider;

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
