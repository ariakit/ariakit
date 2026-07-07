import type { FormStoreValues } from "@ariakit/components/form/form-store";
import type { ProviderComponent } from "@ariakit/react-utils";
import type { PickRequired } from "@ariakit/utils";
import type { ReactElement, ReactNode } from "react";
import { createFormProvider, FormContextProvider } from "./form-context.tsx";
import type { FormStore, FormStoreProps } from "./form-store.ts";
import { useFormStore } from "./form-store.ts";

type Values = FormStoreValues;

export interface FormProviderComponent extends ProviderComponent<FormStore> {
  <T extends Values = Values>(
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
  (props: FormProviderProps): ReactElement;
}

/**
 * Provides a form store to [Form](https://ariakit.com/components/form)
 * components.
 * @see https://ariakit.com/components/form
 * @example
 * ```jsx
 * <FormProvider defaultValues={{ email: "" }}>
 *   <Form>
 *     <FormInput name="email" />
 *   </Form>
 * </FormProvider>
 * ```
 */
export const FormProvider: FormProviderComponent = createFormProvider(
  function FormProvider(props: FormProviderProps = {}) {
    const store = useFormStore(props);
    return (
      <FormContextProvider value={store}>{props.children}</FormContextProvider>
    );
  },
);

export interface FormProviderProps<
  T extends Values = Values,
> extends FormStoreProps<T> {
  children?: ReactNode;
}
