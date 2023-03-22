import {
  createComponent,
  createElement,
  createHook,
} from "../utils/system.jsx";
import { As, Props } from "../utils/types.js";
import { FormGroupOptions, useFormGroup } from "./form-group.js";

/**
 * Returns props to create a `FormRadioGroup` component.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx
 * const store = useFormStore({ defaultValues: { color: "red" } });
 * const props = useFormRadioGroup({ store });
 * <Form store={store}>
 *   <Role {...props}>
 *     <FormGroupLabel>Favorite color</FormGroupLabel>
 *     <FormRadio name={store.names.color} value="red" />
 *     <FormRadio name={store.names.color} value="blue" />
 *     <FormRadio name={store.names.color} value="green" />
 *   </Role>
 * </Form>
 * ```
 */
export const useFormRadioGroup = createHook<FormRadioGroupOptions>(
  ({ store, ...props }) => {
    props = { role: "radiogroup", ...props };
    props = useFormGroup(props);
    return props;
  }
);

/**
 * Renders a radio group in a form.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx
 * const form = useFormStore({ defaultValues: { color: "red" } });
 * <Form store={form}>
 *   <FormRadioGroup>
 *     <FormGroupLabel>Favorite color</FormGroupLabel>
 *     <FormRadio name={form.names.color} value="red" />
 *     <FormRadio name={form.names.color} value="blue" />
 *     <FormRadio name={form.names.color} value="green" />
 *   </FormRadioGroup>
 * </Form>
 * ```
 */
export const FormRadioGroup = createComponent<FormRadioGroupOptions>(
  (props) => {
    const htmlProps = useFormRadioGroup(props);
    return createElement("div", htmlProps);
  }
);

if (process.env.NODE_ENV !== "production") {
  FormRadioGroup.displayName = "FormRadioGroup";
}

export type FormRadioGroupOptions<T extends As = "div"> = FormGroupOptions<T>;

export type FormRadioGroupProps<T extends As = "div"> = Props<
  FormRadioGroupOptions<T>
>;
