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
 * const props = useFormSubmit({ store });
 * <Form store={store}>
 *   <Role {...props}>Submit</Role>
 * </Form>
 * ```
 */
export const useFormSubmit = createHook<TagName, FormSubmitOptions>(
  function useFormSubmit({ store, accessibleWhenDisabled = true, ...props }) {
    const context = useFormContext();
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "FormSubmit must be wrapped in a Form component.",
    );

    props = {
      type: "submit",
      disabled: store.useState("submitting"),
      ...props,
    };

    props = useButton({ ...props, accessibleWhenDisabled });

    return props;
  },
);

/**
 * Renders a native submit button inside a form. The button will be
 * [`disabled`](https://ariakit.org/reference/form-submit#disabled) while the
 * form is submitting, but it will remain accessible to keyboard and screen
 * reader users thanks to the
 * [`accessibleWhenDisabled`](https://ariakit.org/reference/form-submit#accessiblewhendisabled)
 * prop that's enabled by default.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx {4}
 * const form = useFormStore();
 *
 * <Form store={form}>
 *   <FormSubmit>Submit</FormSubmit>
 * </Form>
 * ```
 */
export const FormSubmit = forwardRef(function FormSubmit(
  props: FormSubmitProps,
) {
  const htmlProps = useFormSubmit(props);
  return createElement(TagName, htmlProps);
});

export interface FormSubmitOptions<T extends ElementType = TagName>
  extends ButtonOptions<T> {
  /**
   * Object returned by the
   * [`useFormStore`](https://ariakit.org/reference/use-form-store) hook. If not
   * provided, the closest [`Form`](https://ariakit.org/reference/form) or
   * [`FormProvider`](https://ariakit.org/reference/form-provider) components'
   * context will be used.
   */
  store?: FormStore;
  /**
   * @default true
   */
  accessibleWhenDisabled?: ButtonOptions<T>["accessibleWhenDisabled"];
}

export type FormSubmitProps<T extends ElementType = TagName> = Props<
  T,
  FormSubmitOptions<T>
>;
