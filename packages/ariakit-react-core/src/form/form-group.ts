import { GroupOptions, useGroup } from "../group/group";
import { createComponent, createElement, createHook } from "../utils/system";
import { As, Props } from "../utils/types";
import { FormStore } from "./form-store";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a form group.
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
export const useFormGroup = createHook<FormGroupOptions>(
  ({ store, ...props }) => {
    props = useGroup(props);
    return props;
  }
);

/**
 * A component that renders a form group.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx
 * const form = useFormStore({
 *   defaultValues: {
 *     username: "",
 *     email: "",
 *   },
 * });
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
export const FormGroup = createComponent<FormGroupOptions>((props) => {
  const htmlProps = useFormGroup(props);
  return createElement("div", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  FormGroup.displayName = "FormGroup";
}

export type FormGroupOptions<T extends As = "div"> = GroupOptions<T> & {
  /**
   * Object returned by the `useFormStore` hook. If not provided, the parent
   * `Form` component's context will be used.
   */
  store?: FormStore;
};

export type FormGroupProps<T extends As = "div"> = Props<FormGroupOptions<T>>;
