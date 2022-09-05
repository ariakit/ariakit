import { ChangeEvent, useCallback } from "react";
import { useEvent } from "ariakit-react-utils/hooks";
import { createMemoComponent, useStore } from "ariakit-react-utils/store";
import { createElement, createHook } from "ariakit-react-utils/system";
import { As, Props } from "ariakit-react-utils/types";
import { FocusableOptions, useFocusable } from "../focusable";
import { FormContext } from "./__utils";
import { FormFieldOptions, useFormField } from "./form-field";
import { FormState } from "./form-state";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a form input. Unlike `useFormField`, this hook
 * returns the `value` and `onChange` props that can be passed to a native
 * input, select or textarea elements.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx
 * const state = useFormState({ defaultValues: { email: "" } });
 * const props = useFormInput({ state, name: state.names.email });
 * <Form state={state}>
 *   <FormLabel name={state.names.email}>Email</FormLabel>
 *   <Role as="input" {...props} />
 * </Form>
 * ```
 */
export const useFormInput = createHook<FormInputOptions>(
  ({ state, name: nameProp, ...props }) => {
    const name = `${nameProp}`;
    state = useStore(state || FormContext, [
      "setValue",
      useCallback((s: FormState) => s.getValue(name), [name]),
    ]);

    const onChangeProp = props.onChange;

    const onChange = useEvent((event: ChangeEvent<HTMLInputElement>) => {
      onChangeProp?.(event);
      if (event.defaultPrevented) return;
      state?.setValue(name, event.target.value);
    });

    const value = state?.getValue(name);

    props = {
      value,
      ...props,
      onChange,
    };

    props = useFocusable(props);
    props = useFormField({ state, name, ...props });

    return props;
  }
);

/**
 * A component that renders a form input. Unlike `FormField`, this component
 * passes the `value` and `onChange` props down to the underlying element that
 * can be a native input, select or textarea elements.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx
 * const form = useFormState({ defaultValues: { email: "" } });
 * <Form state={form}>
 *   <FormLabel name={form.names.email}>Email</FormLabel>
 *   <FormInput name={form.names.email} />
 * </Form>
 * ```
 */
export const FormInput = createMemoComponent<FormInputOptions>((props) => {
  const htmlProps = useFormInput(props);
  return createElement("input", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  FormInput.displayName = "FormInput";
}

export type FormInputOptions<T extends As = "input"> = FocusableOptions<T> &
  FormFieldOptions<T>;

export type FormInputProps<T extends As = "input"> = Props<FormInputOptions<T>>;
