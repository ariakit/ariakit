import type { FormStoreValues } from "@ariakit/core/form/form-store";
import type { PickRequired } from "@ariakit/core/utils/types";
import type { ReactElement, ReactNode } from "react";
import { FormContextProvider } from "./form-context.tsx";
import type { FormStoreProps } from "./form-store.ts";
import { useFormStore } from "./form-store.ts";

type Values = FormStoreValues;

/**
 * Provides a form store to [Form](https://ariakit.org/components/form)
 * components.
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
    FormProviderProps<T>,
    | "values"
    | "defaultValues"
    | "errors"
    | "defaultErrors"
    | "touched"
    | "defaultTouched"
  >,
): ReactElement;

export function FormProvider(props: FormProviderProps): ReactElement;

export function FormProvider(props: FormProviderProps = {}) {
  const store = useFormStore(props);
  return (
    <FormContextProvider value={store}>{props.children}</FormContextProvider>
  );
}

export interface FormProviderProps<T extends Values = Values>
  extends FormStoreProps<T> {
  children?: ReactNode;
}
