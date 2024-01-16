import type { GroupOptions } from "../group/group.js";
import { useGroup } from "../group/group.js";
import { createElement, createHook2 } from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import type { FormStore } from "./form-store.js";

/**
 * Returns props to create a `FormGroup` component.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx
 * const store = useFormStore();
 * const props = useFormGroup({ store });
 * <Form store={store}>
 *   <Role {...props}>
 *     <FormGroupLabel>Label</FormGroupLabel>
 *   </Role>
 * </Form>
 * ```
 */
export const useFormGroup = createHook2<TagName, FormGroupOptions>(
  ({ store, ...props }) => {
    props = useGroup(props);
    return props;
  },
);

/**
 * Renders a group element for form controls. The
 * [`FormGroupLabel`](https://ariakit.org/reference/form-group-label) component
 * can be used inside this component so the `aria-labelledby` prop is properly
 * set on the group element.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx {9-15}
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
export const FormGroup = forwardRef(function FormGroup(props: FormGroupProps) {
  const htmlProps = useFormGroup(props);
  return createElement(TagName, htmlProps);
});

export interface FormGroupOptions<T extends ElementType = TagName>
  extends GroupOptions<T> {
  /**
   * Object returned by the
   * [`useFormStore`](https://ariakit.org/reference/use-form-store) hook. If not
   * provided, the closest [`Form`](https://ariakit.org/reference/form) or
   * [`FormProvider`](https://ariakit.org/reference/form-provider) components'
   * context will be used.
   */
  store?: FormStore;
}

export type FormGroupProps<T extends ElementType = TagName> = Props<
  FormGroupOptions<T>
>;
