"use client";
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
export const useDialogContext = ctx.useContext;

export const useDialogScopedContext = ctx.useScopedContext;

export const useDialogProviderContext = ctx.useProviderContext;

export const DialogContextProvider = ctx.ContextProvider;

export const DialogScopedContextProvider = ctx.ScopedContextProvider;

export const DialogHeadingContext = createContext<
  SetState<string | undefined> | undefined
>(undefined);
export const DialogDescriptionContext = createContext<
  SetState<string | undefined> | undefined
>(undefined);
