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
import type { FormControlOptions } from "./form-control.js";
import { useFormControl } from "./form-control.js";

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
export const useFormCheckbox = createHook2<TagName, FormCheckboxOptions>(
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

    props = useFormControl({
      store,
      name,
      "aria-labelledby": undefined,
      ...props,
    });

    return props;
  },
);

/**
 * Renders a checkbox input as a form control, representing a boolean, string,
 * number, or array value.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx {9}
 * const form = useFormStore({
 *   defaultValues: {
 *     acceptTerms: false,
 *   },
 * });
 *
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
    return createElement(TagName, htmlProps);
  },
);

export interface FormCheckboxOptions<T extends ElementType = TagName>
  extends FormControlOptions<T>,
    Omit<CheckboxOptions<T>, "store" | "name"> {}

export type FormCheckboxProps<T extends ElementType = TagName> = Props<
  FormCheckboxOptions<T>
>;
