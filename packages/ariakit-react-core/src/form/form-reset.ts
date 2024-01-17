import type { ElementType } from "react";
import { invariant } from "@ariakit/core/utils/misc";
import type { ButtonOptions } from "../button/button.js";
import { useButton } from "../button/button.js";
import { createElement, createHook, forwardRef } from "../utils/system.js";
import type { Props } from "../utils/types.js";
import { useFormContext } from "./form-context.js";
import type { FormStore } from "./form-store.js";

const TagName = "button" satisfies ElementType;
type TagName = typeof TagName;

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
export const useFormReset = createHook<TagName, FormResetOptions>(
  function useFormReset({ store, ...props }) {
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
 * Renders a button that resets the form to its initial values, as defined by
 * the
 * [`defaultValues`](https://ariakit.org/reference/use-form-store#defaultvalues)
 * prop given to the form store.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx {4}
 * const form = useFormStore();
 *
 * <Form store={form}>
 *   <FormReset>Reset</FormReset>
 * </Form>
 * ```
 */
export const FormReset = forwardRef(function FormReset(props: FormResetProps) {
  const htmlProps = useFormReset(props);
  return createElement(TagName, htmlProps);
});

export interface FormResetOptions<T extends ElementType = TagName>
  extends ButtonOptions<T> {
  /**
   * Object returned by the
   * [`useFormStore`](https://ariakit.org/reference/use-form-store) hook. If not
   * provided, the closest [`Form`](https://ariakit.org/reference/form) or
   * [`FormProvider`](https://ariakit.org/reference/form-provider) components'
   * context will be used.
   */
  store?: FormStore;
}

export type FormResetProps<T extends ElementType = TagName> = Props<
  T,
  FormResetOptions<T>
>;
