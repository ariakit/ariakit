import {
  CollectionContextProvider,
  CollectionScopedContextProvider,
} from "../collection/collection-context.js";
import { createStoreContext } from "../utils/system.js";
import type { FormStore } from "./form-store.js";

const ctx = createStoreContext<FormStore>(
  [CollectionContextProvider],
  [CollectionScopedContextProvider],
);

/**
 * Returns the form store from the nearest form container.
 * @example
 * function FormInput() {
 *   const store = useFormContext();
 *
 *   if (!store) {
 *     throw new Error("FormInput must be wrapped in FormProvider");
 *   }
 *
 *   // Use the store...
 * }
 */
export const useFormContext = ctx.useStoreContext;

export const useFormScopedContext = ctx.useScopedStoreContext;

export const useFormProviderContext = ctx.useStoreProviderContext;

export const FormContextProvider = ctx.StoreContextProvider;

export const FormScopedContextProvider = ctx.StoreScopedContextProvider;
