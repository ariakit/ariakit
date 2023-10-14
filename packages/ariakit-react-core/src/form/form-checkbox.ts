import { invariant } from "@ariakit/core/utils/misc";
import { useCheckboxStore } from "../checkbox/checkbox-store.js";
import type { CheckboxOptions } from "../checkbox/checkbox.js";
import { useCheckbox } from "../checkbox/checkbox.js";
import {
  createElement,
  createHook,
  createMemoComponent,
} from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import { useFormContext } from "./form-context.js";
import type { FormFieldOptions } from "./form-field.js";
import { useFormField } from "./form-field.js";

/**
 * Returns props to create a `FormCheckbox` component.
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
    const context = useFormContext();
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "FormCheckbox must be wrapped in a Form component.",
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
  },
);

/**
 * Renders a checkbox as a form field.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx
 * const form = useFormStore({
 *   defaultValues: {
 *     acceptTerms: false,
 *   },
 * });
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
  },
);

if (process.env.NODE_ENV !== "production") {
  FormCheckbox.displayName = "FormCheckbox";
}

export interface FormCheckboxOptions<T extends As = "input">
  extends FormFieldOptions<T>,
    Omit<CheckboxOptions<T>, "store" | "name"> {}

export type FormCheckboxProps<T extends As = "input"> = Props<
  FormCheckboxOptions<T>
>;
