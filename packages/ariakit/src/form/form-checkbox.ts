import { useCallback } from "react";
import { createMemoComponent, useStore } from "ariakit-utils/store";
import { createElement, createHook } from "ariakit-utils/system";
import { As, Props } from "ariakit-utils/types";
import {
  CheckboxOptions,
  CheckboxState,
  useCheckbox,
  useCheckboxState,
} from "../checkbox";
import { FormContext } from "./__utils";
import { FormFieldOptions, useFormField } from "./form-field";
import { FormState } from "./form-state";

function stringIfBoolean<T>(value: T) {
  return typeof value === "boolean"
    ? value.toString()
    : (value as Exclude<T, boolean>);
}

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a checkbox as a form field.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx
 * const state = useFormState({ defaultValues: { acceptTerms: false } });
 * const props = useFormCheckbox({ state, name: state.names.acceptTerms });
 * <Form state={state}>
 *   <label>
 *     <Role {...props} />
 *     Accept terms
 *   </label>
 * </Form>
 * ```
 */
export const useFormCheckbox = createHook<FormCheckboxOptions>(
  ({ state, name: nameProp, value, checked, defaultChecked, ...props }) => {
    const name = `${nameProp}`;
    state = useStore(state || FormContext, [
      "setValue",
      useCallback((s: FormState) => stringIfBoolean(s.getValue(name)), [name]),
    ]);

    const setValue: CheckboxState["setValue"] = useCallback(
      (value) => state?.setValue(name, value),
      [state?.setValue, name]
    );

    const checkboxState = useCheckboxState({
      value: state?.getValue(name),
      setValue,
    });

    props = useCheckbox({ state: checkboxState, value, checked, ...props });

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
 * A component that renders a checkbox as a form field.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx
 * const form = useFormState({ defaultValues: { acceptTerms: false } });
 * <Form state={form}>
 *   <label>
 *     <FormCheckbox name={form.names.acceptTerms} />
 *     Accept terms
 *   </label>
 * </Form>
 * ```
 */
export const FormCheckbox = createMemoComponent<FormCheckboxOptions>(
  (props) => {
    const htmlProps = useFormCheckbox(props);
    return createElement("input", htmlProps);
  }
);

if (process.env.NODE_ENV !== "production") {
  FormCheckbox.displayName = "FormCheckbox";
}

export type FormCheckboxOptions<T extends As = "input"> = FormFieldOptions<T> &
  Omit<CheckboxOptions<T>, "state">;

export type FormCheckboxProps<T extends As = "input"> = Props<
  FormCheckboxOptions<T>
>;
