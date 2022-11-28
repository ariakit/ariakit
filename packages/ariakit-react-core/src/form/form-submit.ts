import { useContext } from "react";
import { invariant } from "@ariakit/core/utils/misc";
import { ButtonOptions, useButton } from "../button/button";
import { createComponent, createElement, createHook } from "../utils/system";
import { As, Props } from "../utils/types";
import { FormContext } from "./form-context";
import { FormStore } from "./form-store";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a submit buttom in a form.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx
 * const store = useFormStore();
 * const props = useFormSubmit({ store });
 * <Form store={store}>
 *   <Role {...props}>Submit</Role>
 * </Form>
 * ```
 */
export const useFormSubmit = createHook<FormSubmitOptions>(
  ({ store, accessibleWhenDisabled = true, ...props }) => {
    const context = useContext(FormContext);
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "FormSubmit must be wrapped in a Form component"
    );

    props = {
      type: "submit",
      disabled: store.useState("submitting"),
      ...props,
    };

    props = useButton({ ...props, accessibleWhenDisabled });

    return props;
  }
);

/**
 * A component that renders a submit buttom in a form.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx
 * const form = useFormStore();
 * <Form store={form}>
 *   <FormSubmit>Submit</FormSubmit>
 * </Form>
 * ```
 */
export const FormSubmit = createComponent<FormSubmitOptions>((props) => {
  const htmlProps = useFormSubmit(props);
  return createElement("button", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  FormSubmit.displayName = "FormSubmit";
}

export type FormSubmitOptions<T extends As = "button"> = ButtonOptions<T> & {
  /**
   * Object returned by the `useFormStore` hook. If not provided, the parent
   * `Form` component's context will be used.
   */
  store?: FormStore;
};

export type FormSubmitProps<T extends As = "button"> = Props<
  FormSubmitOptions<T>
>;
