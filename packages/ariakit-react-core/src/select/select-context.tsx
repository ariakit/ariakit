import { createContext, useContext } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { CompositeContextProvider } from "../composite/composite-context.js";
import { PopoverContextProvider } from "../popover/popover-context.js";
import type { SelectStore } from "./select-store.js";

export const SelectItemCheckedContext = createContext(false);

export const SelectContext = createContext<SelectStore | undefined>(undefined);

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
export function useSelectContext() {
  return useContext(SelectContext);
}

export function SelectContextProvider(
  props: ComponentPropsWithoutRef<typeof SelectContext.Provider>,
) {
  return (
    <PopoverContextProvider {...props}>
      <CompositeContextProvider {...props}>
        <SelectContext.Provider {...props} />
      </CompositeContextProvider>
    </PopoverContextProvider>
  );
}
