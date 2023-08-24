import { createContext, useContext } from "react";
import type { ComponentPropsWithoutRef } from "react";
import type { CheckboxStore } from "./checkbox-store.js";

export const CheckboxContext = createContext<CheckboxStore | undefined>(
  undefined,
);

/**
 * Returns the checkbox store from the nearest checkbox container.
 * @example
 * function Checkbox() {
 *   const store = useCheckboxContext();
 *
 *   if (!store) {
 *     throw new Error("Checkbox must be wrapped in CheckboxProvider");
 *   }
 *
 *   // Use the store...
 * }
 */
export function useCheckboxContext() {
  return useContext(CheckboxContext);
}

export function CheckboxContextProvider(
  props: ComponentPropsWithoutRef<typeof CheckboxContext.Provider>,
) {
  return <CheckboxContext.Provider {...props} />;
}
