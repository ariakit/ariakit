import { createContext, useContext } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { CompositeContextProvider } from "../composite/composite-context.js";
import type { ToolbarStore } from "./toolbar-store.js";

export const ToolbarContext = createContext<ToolbarStore | undefined>(
  undefined,
);

/**
 * Returns the toolbar store from the nearest toolbar container.
 * @example
 * function ToolbarItem() {
 *   const store = useToolbarContext();
 *
 *   if (!store) {
 *     throw new Error("ToolbarItem must be wrapped in ToolbarProvider");
 *   }
 *
 *   // Use the store...
 * }
 */
export function useToolbarContext() {
  return useContext(ToolbarContext);
}

export function ToolbarContextProvider(
  props: ComponentPropsWithoutRef<typeof ToolbarContext.Provider>,
) {
  return (
    <CompositeContextProvider {...props}>
      <ToolbarContext.Provider {...props} />
    </CompositeContextProvider>
  );
}
