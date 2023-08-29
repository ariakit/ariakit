import type { ReactElement, ReactNode } from "react";
import type { FormStoreValues } from "@ariakit/core/form/form-store";
import type { PickRequired } from "@ariakit/core/utils/types";
import { FormContextProvider } from "./form-context.js";
import { useFormStore } from "./form-store.js";
import type { FormStoreProps } from "./form-store.js";

type Values = FormStoreValues;

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

export function FormProvider<T extends Values = Values>(
  props: PickRequired<
    FormStoreProps<T>,
    | "values"
    | "defaultValues"
    | "errors"
    | "defaultErrors"
    | "touched"
    | "defaultTouched"
  >,
): ReactElement;

export function FormProvider(props: FormStoreProps): ReactElement;

export function FormProvider(props: FormProviderProps = {}) {
  const store = useFormStore(props);
  return (
    <FormContextProvider value={store}>{props.children}</FormContextProvider>
  );
}

export interface FormProviderProps extends FormStoreProps {
  children?: ReactNode;
}
