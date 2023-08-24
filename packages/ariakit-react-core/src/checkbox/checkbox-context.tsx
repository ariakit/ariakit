import { createContext, useContext } from "react";
import type { CheckboxStore } from "./checkbox-store.js";

export const CheckboxContext = createContext<CheckboxStore | undefined>(
  undefined,
);

/**
 * Returns the checkbox store from the nearest checkbox container.
 * @example
 * function CustomCheckbox() {
 *   const store = useCheckboxContext();
 *
 *   if (!store) {
 *     throw new Error("CustomCheckbox must be wrapped in CheckboxProvider");
 *   }
 *
 *   // Use the store...
 * }
 */
export function useCheckboxContext() {
  return useContext(CheckboxContext);
}

export function CheckboxContextProvider(props: {
  value: CheckboxStore;
  children?: React.ReactNode;
}) {
  return <CheckboxContext.Provider {...props} />;
}
