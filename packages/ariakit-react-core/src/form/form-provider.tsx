import type { ReactNode } from "react";
import { FormContextProvider } from "./form-context.js";
import { useFormStore } from "./form-store.js";
import type { FormStoreProps } from "./form-store.js";

/**
 * Provides a form store to Form components.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx
 * <FormProvider defaultValues={{ email: "" }}>
 *   <Form>
 *     <FormInput />
 *   </Form>
 * </FormProvider>
 * ```
 */
export function FormProvider(props: FormProviderProps = {}) {
  const store = useFormStore(props);
  return (
    <FormContextProvider value={store}>{props.children}</FormContextProvider>
  );
}

export interface FormProviderProps extends FormStoreProps {
  children?: ReactNode;
}
