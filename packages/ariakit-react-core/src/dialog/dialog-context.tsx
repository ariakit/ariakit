import { createContext, useContext } from "react";
import type { ComponentPropsWithoutRef } from "react";
import type { SetState } from "@ariakit/core/utils/types";
import { DisclosureContextProvider } from "../disclosure/disclosure-context.js";
import type { DialogStore } from "./dialog-store.js";

export const DialogContext = createContext<DialogStore | undefined>(undefined);

/**
 * Returns the dialog store from the nearest dialog container.
 * @example
 * function Dialog() {
 *   const store = useDialogContext();
 *
 *   if (!store) {
 *     throw new Error("Dialog must be wrapped in DialogProvider");
 *   }
 *
 *   // Use the store...
 * }
 */
export function useDialogContext() {
  return useContext(DialogContext);
}

export function DialogContextProvider(
  props: ComponentPropsWithoutRef<typeof DialogContext.Provider>,
) {
  return (
    <DisclosureContextProvider {...props}>
      <DialogContext.Provider {...props} />
    </DisclosureContextProvider>
  );
}

export const DialogHeadingContext = createContext<
  SetState<string | undefined> | undefined
>(undefined);
export const DialogDescriptionContext = createContext<
  SetState<string | undefined> | undefined
>(undefined);
