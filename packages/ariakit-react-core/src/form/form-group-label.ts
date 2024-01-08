import type { GroupLabelOptions } from "../group/group-label.js";
import { useGroupLabel } from "../group/group-label.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import type { FormStore } from "./form-store.js";

/**
 * Returns props to create a `FormGroupLabel` component. This hook must be used
 * in a component that's wrapped with `FormGroup` so the `aria-labelledby` prop
 * is properly set on the form group element.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx
 * // This component must be wrapped with FormGroup
 * const props = useFormGroupLabel();
 * <Role {...props}>Label</Role>
 * ```
 */
export const useFormGroupLabel = createHook<FormGroupLabelOptions>(
  ({ store, ...props }) => {
    props = useGroupLabel(props);
    return props;
  },
);

/**
 * Renders a label in a form group. This component must be wrapped with the
 * [`FormGroup`](https://ariakit.org/reference/form-group) or
 * [`FormRadioGroup`](https://ariakit.org/reference/form-radio-group) components
 * so the `aria-labelledby` prop is properly set on the form group element.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx {10}
 * const form = useFormStore({
 *   defaultValues: {
 *     username: "",
 *     email: "",
 *   },
 * });
 *
 * <Form store={form}>
 *   <FormGroup>
 *     <FormGroupLabel>Account</FormGroupLabel>
 *     <FormLabel name={form.names.username}>Username</FormLabel>
 *     <FormInput name={form.names.username} />
 *     <FormLabel name={form.names.email}>Email</FormLabel>
 *     <FormInput name={form.names.email} />
 *   </FormGroup>
 * </Form>
 * ```
 */
export const FormGroupLabel = createComponent<FormGroupLabelOptions>(
  (props) => {
    const htmlProps = useFormGroupLabel(props);
    return createElement("div", htmlProps);
  },
);

if (process.env.NODE_ENV !== "production") {
  FormGroupLabel.displayName = "FormGroupLabel";
}

export interface FormGroupLabelOptions<T extends As = "div">
  extends GroupLabelOptions<T> {
  /**
   * Object returned by the
   * [`useFormStore`](https://ariakit.org/reference/use-form-store) hook. If not
   * provided, the closest [`Form`](https://ariakit.org/reference/form) or
   * [`FormProvider`](https://ariakit.org/reference/form-provider) components'
   * context will be used.
   */
  store?: FormStore;
}

export type FormGroupLabelProps<T extends As = "div"> = Props<
  FormGroupLabelOptions<T>
>;
