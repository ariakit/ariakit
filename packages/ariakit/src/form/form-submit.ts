import {
  createHook,
  createComponent,
  createElement,
} from "ariakit-utils/system";
import { As, Props } from "ariakit-utils/types";
import { useStore } from "ariakit-utils/store";
import { ButtonOptions, useButton } from "../button";
import { FormState } from "./form-state";
import { FormContext } from "./__utils";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a submit buttom in a form.
 * @see https://ariakit.org/docs/form
 * @example
 * ```jsx
 * const state = useFormState();
 * const props = useFormSubmit({ state });
 * <Form state={state}>
 *   <Role {...props}>Submit</Role>
 * </Form>
 * ```
 */
export const useFormSubmit = createHook<FormSubmitOptions>(
  ({ state, accessibleWhenDisabled = true, ...props }) => {
    state = useStore(state || FormContext, ["submitting"]);

    props = {
      type: "submit",
      disabled: state?.submitting,
      ...props,
    };

    props = useButton({ ...props, accessibleWhenDisabled });

    return props;
  }
);

/**
 * A component that renders a submit buttom in a form.
 * @see https://ariakit.org/docs/form
 * @example
 * ```jsx
 * const form = useFormState();
 * <Form state={form}>
 *   <FormSubmit>Submit</FormSubmit>
 * </Form>
 * ```
 */
export const FormSubmit = createComponent<FormSubmitOptions>((props) => {
  const htmlProps = useFormSubmit(props);
  return createElement("button", htmlProps);
});

export type FormSubmitOptions<T extends As = "button"> = ButtonOptions<T> & {
  /**
   * Object returned by the `useFormState` hook. If not provided, the parent
   * `Form` component's context will be used.
   */
  state?: FormState;
};

export type FormSubmitProps<T extends As = "button"> = Props<
  FormSubmitOptions<T>
>;
