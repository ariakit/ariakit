import { createContext, useContext } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { CompositeContextProvider } from "../composite/composite-context.js";
import { PopoverContextProvider } from "../popover/popover-context.js";
import type { ComboboxStore } from "./combobox-store.js";

export const ComboboxContext = createContext<ComboboxStore | undefined>(
  undefined,
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
export function useComboboxContext() {
  return useContext(ComboboxContext);
}

export function ComboboxContextProvider(
  props: ComponentPropsWithoutRef<typeof ComboboxContext.Provider>,
) {
  return (
    <PopoverContextProvider {...props}>
      <CompositeContextProvider {...props}>
        <ComboboxContext.Provider {...props} />
      </CompositeContextProvider>
    </PopoverContextProvider>
  );
}

export const ComboboxItemValueContext = createContext<string | undefined>(
  undefined,
);
