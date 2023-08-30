import { invariant } from "@ariakit/core/utils/misc";
import type { ButtonOptions } from "../button/button.js";
import { useButton } from "../button/button.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import { useFormContext } from "./form-context.js";
import type { FormStore } from "./form-store.js";

/**
 * Returns props to create a `FormReset` component.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx
 * const store = useFormStore();
 * const props = useFormReset({ store });
 * <Form store={store}>
 *   <Role {...props}>Reset</Role>
 * </Form>
 * ```
 */
export const useFormReset = createHook<FormResetOptions>(
  ({ store, ...props }) => {
    const context = useFormContext();
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "FormReset must be wrapped in a Form component.",
    );

    props = {
      type: "reset",
      disabled: store.useState("submitting"),
      ...props,
    };

    props = useButton(props);

    return props;
  },
);

/**
 * Renders a reset buttom in a form.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx
 * const form = useFormStore();
 * <Form store={form}>
 *   <FormReset>Reset</FormReset>
 * </Form>
 * ```
 */
export const FormReset = createComponent<FormResetOptions>((props) => {
  const htmlProps = useFormReset(props);
  return createElement("button", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  FormReset.displayName = "FormReset";
}

export interface FormResetOptions<T extends As = "button">
  extends ButtonOptions<T> {
  /**
   * Object returned by the `useFormStore` hook. If not provided, the parent
   * `Form` component's context will be used.
   */
  store?: FormStore;
}

export type FormResetProps<T extends As = "button"> = Props<
  FormResetOptions<T>
>;
