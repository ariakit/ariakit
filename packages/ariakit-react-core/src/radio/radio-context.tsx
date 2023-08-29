import { createContext, useContext } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { CompositeContextProvider } from "../composite/composite-context.js";
import type { RadioStore } from "./radio-store.js";

export const RadioContext = createContext<RadioStore | undefined>(undefined);

/**
 * Returns the radio store from the nearest radio container.
 * @example
 * function Radio() {
 *   const store = useRadioContext();
 *
 *   if (!store) {
 *     throw new Error("Radio must be wrapped in RadioProvider");
 *   }
 *
 *   // Use the store...
 * }
 */
export function useRadioContext() {
  return useContext(RadioContext);
}

export function RadioContextProvider(
  props: ComponentPropsWithoutRef<typeof RadioContext.Provider>,
) {
  return (
    <CompositeContextProvider {...props}>
      <RadioContext.Provider {...props} />
    </CompositeContextProvider>
  );
}
