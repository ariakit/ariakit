import { createContext, useContext } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { CollectionContextProvider } from "../collection/collection-context.js";
import type { FormStore } from "./form-store.js";

export const FormContext = createContext<FormStore | undefined>(undefined);

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
export function useFormContext() {
  return useContext(FormContext);
}

export function FormContextProvider(
  props: ComponentPropsWithoutRef<typeof FormContext.Provider>,
) {
  return (
    <CollectionContextProvider {...props}>
      <FormContext.Provider {...props} />
    </CollectionContextProvider>
  );
}
