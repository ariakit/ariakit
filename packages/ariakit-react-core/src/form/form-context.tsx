import {
  CollectionContextProvider,
  CollectionScopedContextProvider,
} from "../collection/collection-context.tsx";
import { createStoreContext } from "../utils/system.tsx";
import type { FormStore } from "./form-store.ts";

const ctx = createStoreContext<FormStore>(
  "FormProvider",
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
export const useFormContext = ctx.useContext;
export const useFormContextStore = ctx.useContextStore;

export const useFormScopedContext = ctx.useScopedContext;
export const useFormScopedContextStore = ctx.useScopedContextStore;

export const useFormProviderContext = ctx.useProviderContext;
export const useFormProviderContextStore = ctx.useProviderContextStore;

export const FormContextProvider = ctx.ContextProvider;

export const FormScopedContextProvider = ctx.ScopedContextProvider;

export const registerFormProvider = ctx.registerProvider;
