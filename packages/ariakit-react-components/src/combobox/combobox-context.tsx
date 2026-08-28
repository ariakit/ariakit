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
import type { ComboboxStore } from "./combobox-store.ts";

export const ComboboxListRoleContext = createContext<string | undefined>(
  undefined,
);

/**
 * Lets a nested combobox list register itself with the nearest list above it,
 * so that list can tell whether it contains another one that owns the popup
 * role. The registration is forwarded up the chain, so lists that share an
 * element learn about it too. Registering returns a cleanup function, or
 * nothing when the element is the receiving list's own element.
 */
export const ComboboxNestedListContext = createContext<
  ((element: Element) => (() => void) | undefined) | null
>(null);

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
export const useComboboxContext = ctx.useContext;

export const useComboboxScopedContext = ctx.useScopedContext;

export const useComboboxProviderContext = ctx.useProviderContext;

export const ComboboxContextProvider = ctx.ContextProvider;

export const ComboboxScopedContextProvider = ctx.ScopedContextProvider;

export const ComboboxItemValueContext = createContext<string | undefined>(
  undefined,
);

export const ComboboxItemCheckedContext = createContext(false);

export const ComboboxHeadingContext = createContext<
  [string | undefined, Dispatch<SetStateAction<string | undefined>>] | null
>(null);
