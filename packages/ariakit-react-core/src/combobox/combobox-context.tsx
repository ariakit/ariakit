import { createContext } from "react";
import {
  CompositeContextProvider,
  CompositeScopedContextProvider,
} from "../composite/composite-context.js";
import {
  PopoverContextProvider,
  PopoverScopedContextProvider,
} from "../popover/popover-context.js";
import { createStoreContext } from "../utils/system.js";
import type { ComboboxStore } from "./combobox-store.js";

const ctx = createStoreContext<ComboboxStore>(
  [PopoverContextProvider, CompositeContextProvider],
  [PopoverScopedContextProvider, CompositeScopedContextProvider],
);

/**
 * Returns the combobox store from the nearest combobox container.
 * @example
 * function Combobox() {
 *   const store = useComboboxContext();
 *
 *   if (!store) {
 *     throw new Error("Combobox must be wrapped in ComboboxProvider");
 *   }
 *
 *   // Use the store...
 * }
 */
export const useComboboxContext = ctx.useStoreContext;

export const useComboboxScopedContext = ctx.useScopedStoreContext;

export const useComboboxProviderContext = ctx.useStoreProviderContext;

export const ComboboxContextProvider = ctx.StoreContextProvider;

export const ComboboxScopedContextProvider = ctx.StoreScopedContextProvider;

export const ComboboxItemValueContext = createContext<string | undefined>(
  undefined,
);
