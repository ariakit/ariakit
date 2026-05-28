import { createStoreContext } from "@ariakit/react-utils";
import type { SetState } from "@ariakit/utils";
import { createContext, useContext } from "react";
import {
  DisclosureContextProvider,
  DisclosureScopedContextProvider,
} from "../disclosure/disclosure-context.tsx";
import type { DialogStore } from "./dialog-store.ts";

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
export const useDialogContext = ctx.useContext;

export const useDialogScopedContext = ctx.useScopedContext;

export const useDialogProviderContext = ctx.useProviderContext;

export const DialogContextProvider = ctx.ContextProvider;

export const DialogScopedContextProvider = ctx.ScopedContextProvider;

export const DialogDismissContext = createContext<DialogStore["hide"] | null>(
  null,
);

export const useDialogDismissContext = () => useContext(DialogDismissContext);

export const DialogHeadingContext = createContext<
  SetState<string | undefined> | undefined
>(undefined);
export const DialogDescriptionContext = createContext<
  SetState<string | undefined> | undefined
>(undefined);
