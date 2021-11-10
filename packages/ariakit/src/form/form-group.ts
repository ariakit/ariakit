import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { As, Props } from "ariakit-utils/types";
import { GroupOptions, useGroup } from "../group";
import { FormState } from "./form-state";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a form group.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx
 * const state = useFormState();
 * const props = useFormGroup({ state });
 * <Form state={state}>
 *   <Role {...props}>
 *     <FormGroupLabel>Label</FormGroupLabel>
 *   </Role>
 * </Form>
 * ```
 */
export const useFormGroup = createHook<FormGroupOptions>(
  ({ state, ...props }) => {
    props = useGroup(props);
    return props;
  }
);

/**
 * A component that renders a form group.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx
 * const form = useFormState({
 *   defaultValues: {
 *     username: "",
 *     email: "",
 *   },
 * });
 * <Form state={form}>
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

export type FormGroupOptions<T extends As = "div"> = GroupOptions<T> & {
  /**
   * Object returned by the `useFormState` hook. If not provided, the parent
   * `Form` component's context will be used.
   */
  state?: FormState;
};

export type FormGroupProps<T extends As = "div"> = Props<FormGroupOptions<T>>;
