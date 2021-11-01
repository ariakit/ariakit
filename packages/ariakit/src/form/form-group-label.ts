import {
  createHook,
  createComponent,
  createElement,
} from "ariakit-utils/system";
import { As, Props } from "ariakit-utils/types";
import { GroupLabelOptions, useGroupLabel } from "../group";
import { FormState } from "./form-state";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a label in a form group. This hook must be used
 * in a component that's wrapped with `FormGroup` so the `aria-labelledby` prop
 * is properly set on the form group element.
 * @see https://ariakit.org/docs/form
 * @example
 * ```jsx
 * // This component must be wrapped with FormGroup
 * const props = useFormGroupLabel();
 * <Role {...props}>Label</Role>
 * ```
 */
export const useFormGroupLabel = createHook<FormGroupLabelOptions>(
  ({ state, ...props }) => {
    props = useGroupLabel(props);
    return props;
  }
);

/**
 * A component that renders a label in a form group. This component must be
 * wrapped with `FormGroup` so the `aria-labelledby` prop is properly set on the
 * form group element.
 * @see https://ariakit.org/docs/form
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
export const FormGroupLabel = createComponent<FormGroupLabelOptions>(
  (props) => {
    const htmlProps = useFormGroupLabel(props);
    return createElement("div", htmlProps);
  }
);

export type FormGroupLabelOptions<T extends As = "div"> =
  GroupLabelOptions<T> & {
    /**
     * Object returned by the `useFormState` hook. If not provided, the parent
     * `Form` component's context will be used.
     */
    state?: FormState;
  };

export type FormGroupLabelProps<T extends As = "div"> = Props<
  FormGroupLabelOptions<T>
>;
