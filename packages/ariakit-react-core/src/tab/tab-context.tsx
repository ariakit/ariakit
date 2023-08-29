import { createContext, useContext } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { CompositeContextProvider } from "../composite/composite-context.js";
import type { TabStore } from "./tab-store.js";

export const TabContext = createContext<TabStore | undefined>(undefined);

/**
 * Returns the tab store from the nearest tab container.
 * @example
 * function Tab() {
 *   const store = useTabContext();
 *
 *   if (!store) {
 *     throw new Error("Tab must be wrapped in TabProvider");
 *   }
 *
 *   // Use the store...
 * }
 */
export function useTabContext() {
  return useContext(TabContext);
}

export function TabContextProvider(
  props: ComponentPropsWithoutRef<typeof TabContext.Provider>,
) {
  return (
    <CompositeContextProvider {...props}>
      <TabContext.Provider {...props} />
    </CompositeContextProvider>
  );
}
