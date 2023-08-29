import { createContext, useContext } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { HovercardContextProvider } from "../hovercard/hovercard-context.js";
import type { TooltipStore } from "./tooltip-store.js";

export const TooltipContext = createContext<TooltipStore | undefined>(
  undefined,
);

/**
 * Returns the tooltip store from the nearest tooltip container.
 * @example
 * function Tooltip() {
 *   const store = useTooltipContext();
 *
 *   if (!store) {
 *     throw new Error("Tooltip must be wrapped in TooltipProvider");
 *   }
 *
 *   // Use the store...
 * }
 */
export function useTooltipContext() {
  return useContext(TooltipContext);
}

export function TooltipContextProvider(
  props: ComponentPropsWithoutRef<typeof TooltipContext.Provider>,
) {
  return (
    <HovercardContextProvider {...props}>
      <TooltipContext.Provider {...props} />
    </HovercardContextProvider>
  );
}
