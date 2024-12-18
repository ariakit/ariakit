import { createContext } from "react";
import {
  CompositeContextProvider,
  CompositeScopedContextProvider,
} from "../composite/composite-context.tsx";
import { createStoreContext } from "../utils/system.tsx";
import type { TagStore } from "./tag-store.ts";

export const TagValueContext = createContext<string | null>(null);
export const TagRemoveIdContext = createContext<((id?: string) => void) | null>(
  null,
);

const ctx = createStoreContext<TagStore>(
  [CompositeContextProvider],
  [CompositeScopedContextProvider],
);

/**
 * Returns the tag store from the nearest tag container.
 * @example
 * function Tag() {
 *   const store = useTagContext();
 *
 *   if (!store) {
 *     throw new Error("Tag must be wrapped in TagProvider");
 *   }
 *
 *   // Use the store...
 * }
 */
export const useTagContext = ctx.useContext;

export const useTagScopedContext = ctx.useScopedContext;

export const useTagProviderContext = ctx.useProviderContext;

export const TagContextProvider = ctx.ContextProvider;

export const TagScopedContextProvider = ctx.ScopedContextProvider;
