import { createContext } from "react";
import type { SetState } from "@ariakit/core/utils/types";
import {
  DisclosureContextProvider,
  DisclosureScopedContextProvider,
} from "../disclosure/disclosure-context.js";
import { createStoreContext } from "../utils/system.js";
import type { DialogStore } from "./dialog-store.js";

const ctx = createStoreContext<DialogStore>(
  [DisclosureContextProvider],
  [DisclosureScopedContextProvider],
);

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
export const useDialogContext = ctx.useStoreContext;

export const useDialogScopedContext = ctx.useScopedStoreContext;

export const useDialogProviderContext = ctx.useStoreProviderContext;

export const DialogContextProvider = ctx.StoreContextProvider;

export const DialogScopedContextProvider = ctx.StoreScopedContextProvider;

export const DialogHeadingContext = createContext<
  SetState<string | undefined> | undefined
>(undefined);
export const DialogDescriptionContext = createContext<
  SetState<string | undefined> | undefined
>(undefined);
