import { ChangeEvent, useCallback } from "react";
import { useEventCallback } from "ariakit-utils/hooks";
import { createMemoComponent, useStore } from "ariakit-utils/store";
import { createElement, createHook } from "ariakit-utils/system";
import { As, Props } from "ariakit-utils/types";
import { FormContext } from "./__utils";
import { FormFieldOptions, useFormField } from "./form-field";
import { FormState } from "./form-state";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a form input. Unline `useFormField`, this hook
 * returns the `value` and `onChange` props that can be passed to a native
 * input, select or textarea elements.
 * @see https://ariakit.org/docs/form
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

    const onChangeProp = useEventCallback(props.onChange);

    const onChange = useCallback(
      (event: ChangeEvent<HTMLInputElement>) => {
        onChangeProp(event);
        if (event.defaultPrevented) return;
        state?.setValue(name, event.target.value);
      },
      [onChangeProp, state?.setValue, name]
    );

    const value = state?.getValue(name);

    props = {
      value,
      ...props,
      onChange,
    };

    props = useFormField({ state, name, ...props });

    return props;
  }
);

/**
 * A component that renders a form input. Unline `FormField`, this component
 * passes the `value` and `onChange` props down to the underlying element that
 * can be a native input, select or textarea elements.
 * @see https://ariakit.org/docs/form
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

export type FormInputOptions<T extends As = "input"> = FormFieldOptions<T>;

export type FormInputProps<T extends As = "input"> = Props<FormInputOptions<T>>;
