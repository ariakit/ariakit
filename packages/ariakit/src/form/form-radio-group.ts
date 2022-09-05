import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-react-utils/system";
import { As, Props } from "ariakit-react-utils/types";
import { FormGroupOptions, useFormGroup } from "./form-group";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a radio group in a form.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx
 * const state = useFormState({ defaultValues: { color: "red" } });
 * const props = useFormRadioGroup({ state });
 * <Form state={state}>
 *   <Role {...props}>
 *     <FormGroupLabel>Favorite color</FormGroupLabel>
 *     <FormRadio name={state.names.color} value="red" />
 *     <FormRadio name={state.names.color} value="blue" />
 *     <FormRadio name={state.names.color} value="green" />
 *   </Role>
 * </Form>
 * ```
 */
export const useFormRadioGroup = createHook<FormRadioGroupOptions>(
  ({ state, ...props }) => {
    props = { role: "radiogroup", ...props };
    props = useFormGroup(props);
    return props;
  }
);

/**
 * A component that renders a radio group in a form.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx
 * const form = useFormState({ defaultValues: { color: "red" } });
 * <Form state={form}>
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
