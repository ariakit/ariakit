import { createStoreContext } from "@ariakit/react-utils";
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
import type { SelectStore } from "./select-store.ts";

const ctx = createStoreContext<SelectStore>(
  [PopoverContextProvider, CompositeContextProvider],
  [PopoverScopedContextProvider, CompositeScopedContextProvider],
);

/**
 * Returns the select store from the nearest select container.
 * @deprecated Use
 * [`useComboboxContext`](https://ariakit.com/reference/use-combobox-context)
 * instead.
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

/** @deprecated Use `useComboboxScopedContext` instead. */
export const useSelectScopedContext = ctx.useScopedContext;

/** @deprecated Use `useComboboxProviderContext` instead. */
export const useSelectProviderContext = ctx.useProviderContext;

/** @deprecated Use `ComboboxContextProvider` instead. */
export const SelectContextProvider = ctx.ContextProvider;

/** @deprecated Use `ComboboxScopedContextProvider` instead. */
export const SelectScopedContextProvider = ctx.ScopedContextProvider;

/** @deprecated Use `ComboboxItemCheckedContext` instead. */
export const SelectItemCheckedContext = createContext(false);

/** @deprecated Use `ComboboxHeadingContext` instead. */
export const SelectHeadingContext = createContext<
  [string | undefined, Dispatch<SetStateAction<string | undefined>>] | null
>(null);
