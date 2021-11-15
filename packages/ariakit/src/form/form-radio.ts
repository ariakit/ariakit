import { ChangeEvent, useCallback } from "react";
import { useEventCallback } from "ariakit-utils/hooks";
import { createMemoComponent, useStore } from "ariakit-utils/store";
import { createElement, createHook } from "ariakit-utils/system";
import { As, Props } from "ariakit-utils/types";
import { RadioOptions, useRadio } from "../radio/radio";
import { FormContext } from "./__utils";
import { FormFieldOptions, useFormField } from "./form-field";
import { FormState } from "./form-state";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a radio button in a form.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx
 * const state = useFormState({ defaultValues: { char: "a" } });
 * const a = useFormRadio({ state, name: state.names.char, value: "a" });
 * const b = useFormRadio({ state, name: state.names.char, value: "b" });
 * const c = useFormRadio({ state, name: state.names.char, value: "c" });
 * <Form state={state}>
 *   <FormRadioGroup>
 *     <FormGroupLabel>Favorite character</FormGroupLabel>
 *     <Role {...a} />
 *     <Role {...b} />
 *     <Role {...c} />
 *   </FormRadioGroup>
 * </Form>
 * ```
 */
export const useFormRadio = createHook<FormRadioOptions>(
  ({ state, name: nameProp, value, ...props }) => {
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
        state?.setValue(name, value);
      },
      [onChangeProp, state?.setValue, name, value]
    );

    const checked = props.checked ?? state?.getValue(name) === value;

    props = {
      ...props,
      checked,
      onChange,
    };

    props = useRadio({ value, ...props });

    props = useFormField({
      state,
      name,
      "aria-labelledby": undefined,
      ...props,
    });

    return props;
  }
);

/**
 * A component that renders a radio button in a form.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx
 * const form = useFormState({ defaultValues: { char: "a" } });
 * <Form state={form}>
 *   <FormRadioGroup>
 *     <FormGroupLabel>Favorite character</FormGroupLabel>
 *     <FormRadio name={form.names.char} value="a" />
 *     <FormRadio name={form.names.char} value="b" />
 *     <FormRadio name={form.names.char} value="c" />
 *   </FormRadioGroup>
 * </Form>
 * ```
 */
export const FormRadio = createMemoComponent<FormRadioOptions>((props) => {
  const htmlProps = useFormRadio(props);
  return createElement("input", htmlProps);
});

export type FormRadioOptions<T extends As = "input"> = FormFieldOptions<T> &
  Omit<RadioOptions<T>, "state">;

export type FormRadioProps<T extends As = "input"> = Props<FormRadioOptions<T>>;
