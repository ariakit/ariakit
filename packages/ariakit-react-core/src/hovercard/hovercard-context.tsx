import { createContext, useContext } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { PopoverContextProvider } from "../popover/popover-context.js";
import type { HovercardStore } from "./hovercard-store.js";

export const HovercardContext = createContext<HovercardStore | undefined>(
  undefined,
);

/**
 * Returns the hovercard store from the nearest hovercard container.
 * @example
 * function Hovercard() {
 *   const store = useHovercardContext();
 *
 *   if (!store) {
 *     throw new Error("Hovercard must be wrapped in HovercardProvider");
 *   }
 *
 *   // Use the store...
 * }
 */
export function useHovercardContext() {
  return useContext(HovercardContext);
}

export function HovercardContextProvider(
  props: ComponentPropsWithoutRef<typeof HovercardContext.Provider>,
) {
  return (
    <PopoverContextProvider {...props}>
      <HovercardContext.Provider {...props} />
    </PopoverContextProvider>
  );
}
