import { useContext } from "react";
import { invariant } from "@ariakit/core/utils/misc";
import { CheckboxOptions, useCheckbox } from "../checkbox/checkbox";
import { useCheckboxStore } from "../checkbox/checkbox-store";
import {
  createElement,
  createHook,
  createMemoComponent,
} from "../utils/system";
import { As, Props } from "../utils/types";
import { FormContext } from "./form-context";
import { FormFieldOptions, useFormField } from "./form-field";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a checkbox as a form field.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx
 * const store = useFormStore({ defaultValues: { acceptTerms: false } });
 * const props = useFormCheckbox({ store, name: store.names.acceptTerms });
 * <Form store={store}>
 *   <label>
 *     <Role {...props} />
 *     Accept terms
 *   </label>
 * </Form>
 * ```
 */
export const useFormCheckbox = createHook<FormCheckboxOptions>(
  ({ store, name: nameProp, value, checked, defaultChecked, ...props }) => {
    const context = useContext(FormContext);
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "FormCheckbox must be wrapped in a Form component"
    );

    const name = `${nameProp}`;

    const checkboxStore = useCheckboxStore({
      value: store.useValue(name),
      setValue: (value) => store?.setValue(name, value),
    });

    props = useCheckbox({ store: checkboxStore, value, checked, ...props });

    props = useFormField({
      store,
      name,
      "aria-labelledby": undefined,
      ...props,
    });

    return props;
  }
);

/**
 * A component that renders a checkbox as a form field.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx
 * const form = useFormStore({ defaultValues: { acceptTerms: false } });
 * <Form store={form}>
 *   <label>
 *     <FormCheckbox name={form.names.acceptTerms} />
 *     Accept terms
 *   </label>
 * </Form>
 * ```
 */
export const FormCheckbox = createMemoComponent<FormCheckboxOptions>(
  (props) => {
    const htmlProps = useFormCheckbox(props);
    return createElement("input", htmlProps);
  }
);

if (process.env.NODE_ENV !== "production") {
  FormCheckbox.displayName = "FormCheckbox";
}

export type FormCheckboxOptions<T extends As = "input"> = FormFieldOptions<T> &
  Omit<CheckboxOptions<T>, "store">;

export type FormCheckboxProps<T extends As = "input"> = Props<
  FormCheckboxOptions<T>
>;
