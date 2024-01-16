import type { ChangeEvent } from "react";
import { invariant } from "@ariakit/core/utils/misc";
import type { FocusableOptions } from "../focusable/focusable.js";
import { useFocusable } from "../focusable/focusable.js";
import { useEvent } from "../utils/hooks.js";
import {
  createElement,
  createHook,
  createMemoComponent,
} from "../utils/system.js";
import type { Props2 } from "../utils/types.js";
import { useFormContext } from "./form-context.js";
import type { FormControlOptions } from "./form-control.js";
import { useFormControl } from "./form-control.js";

/**
 * Returns props to create a `FormInput` component. Unlike `useFormControl`, this
 * hook returns the `value` and `onChange` props that can be passed to a native
 * input, select or textarea elements.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx
 * const store = useFormStore({ defaultValues: { email: "" } });
 * const props = useFormInput({ store, name: store.names.email });
 * <Form store={store}>
 *   <FormLabel name={store.names.email}>Email</FormLabel>
 *   <Role {...props} render={<input />} />
 * </Form>
 * ```
 */
export const useFormInput = createHook2<TagName, FormInputOptions>(
  function useFormInput({ store, name: nameProp, ...props }) {
    const context = useFormContext();
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "FormInput must be wrapped in a Form component.",
    );

    const name = `${nameProp}`;
    const onChangeProp = props.onChange;

    const onChange = useEvent((event: ChangeEvent<HTMLInputElement>) => {
      onChangeProp?.(event);
      if (event.defaultPrevented) return;
      store?.setValue(name, event.target.value);
    });

    const value = store.useValue(name);

    props = {
      value,
      ...props,
      onChange,
    };

    props = useFocusable(props);
    props = useFormControl({ store, name, ...props });

    return props;
  },
);

/**
 * Renders a form input. Unlike
 * [`FormControl`](https://ariakit.org/reference/form-control), this component
 * passes the `value` and `onChange` props down to the underlying element that
 * can be native input, select or textarea elements.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx {9}
 * const form = useFormStore({
 *   defaultValues: {
 *     email: "",
 *   },
 * });
 *
 * <Form store={form}>
 *   <FormLabel name={form.names.email}>Email</FormLabel>
 *   <FormInput name={form.names.email} />
 * </Form>
 * ```
 */
export const FormInput = createMemoComponent<FormInputOptions>((props) => {
  const htmlProps = useFormInput(props);
  return createElement(TagName, htmlProps);
});

export interface FormInputOptions<T extends ElementType = TagName>
  extends FormControlOptions<T>,
    FocusableOptions<T> {}

export type FormInputProps<T extends ElementType = TagName> = Props2<
  T,
  FormInputOptions<T>
>;
