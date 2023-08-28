import { createContext, useContext } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { DialogContextProvider } from "../dialog/dialog-context.js";
import type { PopoverStore } from "./popover-store.js";

export const PopoverContext = createContext<PopoverStore | undefined>(
  undefined,
);

/**
 * Returns the popover store from the nearest popover container.
 * @example
 * function Popover() {
 *   const store = usePopoverContext();
 *
 *   if (!store) {
 *     throw new Error("Popover must be wrapped in PopoverProvider");
 *   }
 *
 *   // Use the store...
 * }
 */
export function usePopoverContext() {
  return useContext(PopoverContext);
}

export function PopoverContextProvider(
  props: ComponentPropsWithoutRef<typeof PopoverContext.Provider>,
) {
  return (
    <DialogContextProvider {...props}>
      <PopoverContext.Provider {...props} />
    </DialogContextProvider>
  );
}
