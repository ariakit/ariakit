import type { Dispatch, SetStateAction } from "react";
import { createContext } from "react";
import {
  CompositeContextProvider,
  CompositeScopedContextProvider,
} from "../composite/composite-context.tsx";
import {
  PopoverContextProvider,
  PopoverScopedContextProvider,
} from "../popover/popover-context.tsx";
import { createStoreContext } from "../utils/system.tsx";
import type { SelectStore } from "./select-store.ts";

const ctx = createStoreContext<SelectStore>(
  [PopoverContextProvider, CompositeContextProvider],
  [PopoverScopedContextProvider, CompositeScopedContextProvider],
);

/**
 * Returns the select store from the nearest select container.
 * @example
 * function Select() {
 *   const store = useSelectContext();
 *
 *   if (!store) {
 *     throw new Error("Select must be wrapped in SelectProvider");
 *   }
 *
 *   // Use the store...
 * }
 */
export const useSelectContext = ctx.useContext;

export const useSelectScopedContext = ctx.useScopedContext;

export const useSelectProviderContext = ctx.useProviderContext;

export const SelectContextProvider = ctx.ContextProvider;

export const SelectScopedContextProvider = ctx.ScopedContextProvider;

export const SelectItemCheckedContext = createContext(false);

export const SelectHeadingContext = createContext<
  [string | undefined, Dispatch<SetStateAction<string | undefined>>] | null
>(null);
