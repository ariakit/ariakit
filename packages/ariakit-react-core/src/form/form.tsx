import type { FocusEvent, FormEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { isTextField } from "@ariakit/core/utils/dom";
import {
  useEvent,
  useInitialValue,
  useMergeRefs,
  useTagName,
  useUpdateEffect,
  useWrapElement,
} from "../utils/hooks.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
import type { As, Options, Props } from "../utils/types.js";
import { FormContext } from "./form-context.js";
import type { FormStore, FormStoreState } from "./form-store.js";

function isField(element: HTMLElement, items: FormStoreState["items"]) {
  return items.some(
    (item) => item.type === "field" && item.element === element
  );
}

function getFirstInvalidField(items: FormStoreState["items"]) {
  return items.find(
    (item) =>
      item.type === "field" &&
      item.element?.getAttribute("aria-invalid") === "true"
  );
}

/**
 * Returns props to create a `Form` component.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx
 * const store = useFormStore();
 * const props = useForm({ store, render: <form /> });
 * <Role {...props} />
 * ```
 */
export const useForm = createHook<FormOptions>(
  ({
    store,
    validateOnChange = true,
    validateOnBlur = true,
    resetOnUnmount = false,
    resetOnSubmit = true,
    autoFocusOnSubmit = true,
    ...props
  }) => {
    const ref = useRef<HTMLFormElement>(null);
    const values = store.useState("values");
    const submitSucceed = store.useState("submitSucceed");
    const submitFailed = store.useState("submitFailed");
    const items = store.useState("items");
    const defaultValues = useInitialValue(values);

    useEffect(
      () => (resetOnUnmount ? store.reset : undefined),
      [resetOnUnmount, store.reset]
    );

    useUpdateEffect(() => {
      if (!validateOnChange) return;
      if (values === defaultValues) return;
      store.validate();
    }, [validateOnChange, values, defaultValues, store]);

    useEffect(() => {
      if (!resetOnSubmit) return;
      if (!submitSucceed) return;
      store.reset();
    }, [resetOnSubmit, submitSucceed, store]);

    const [shouldFocusOnSubmit, setShouldFocusOnSubmit] = useState(false);

    useEffect(() => {
      if (!shouldFocusOnSubmit) return;
      if (!submitFailed) return;
      const field = getFirstInvalidField(items);
      const element = field?.element;
      if (!element) return;
      setShouldFocusOnSubmit(false);
      element.focus();
      if (isTextField(element)) {
        element.select();
      }
    }, [autoFocusOnSubmit, submitFailed, items]);

    const onSubmitProp = props.onSubmit;

    const onSubmit = useEvent((event: FormEvent<HTMLFormElement>) => {
      onSubmitProp?.(event);
      if (event.defaultPrevented) return;
      event.preventDefault();
      store.submit();
      if (!autoFocusOnSubmit) return;
      setShouldFocusOnSubmit(true);
    });

    const onBlurProp = props.onBlur;

    const onBlur = useEvent((event: FocusEvent<HTMLFormElement>) => {
      onBlurProp?.(event);
      if (event.defaultPrevented) return;
      if (!validateOnBlur) return;
      if (!isField(event.target, store.getState().items)) return;
      store.validate();
    });

    const onResetProp = props.onReset;

    const onReset = useEvent((event: FormEvent<HTMLFormElement>) => {
      onResetProp?.(event);
      if (event.defaultPrevented) return;
      event.preventDefault();
      store.reset();
    });

    props = useWrapElement(
      props,
      (element) => (
        <FormContext.Provider value={store}>{element}</FormContext.Provider>
      ),
      [store]
    );

    const tagName = useTagName(ref, props.as || "form");

    props = {
      role: tagName !== "form" ? "form" : undefined,
      noValidate: true,
      ...props,
      ref: useMergeRefs(ref, props.ref),
      onSubmit,
      onBlur,
      onReset,
    };

    return props;
  }
);

/**
 * Renders a form element.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx
 * const form = useFormStore({ defaultValues: { username: "johndoe" } });
 * <Form store={form}>
 *   <FormLabel name={form.names.username}>Username</FormLabel>
 *   <FormInput name={form.names.username} />
 * </Form>
 * ```
 */
export const Form = createComponent<FormOptions>((props) => {
  const htmlProps = useForm(props);
  return createElement("form", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  Form.displayName = "Form";
}

export interface FormOptions<T extends As = "form"> extends Options<T> {
  /**
   * Object returned by the `useFormStore` hook.
   */
  store: FormStore;
  /**
   * Whether the form should trigger the validation callbacks when values
   * change.
   * @default true
   */
  validateOnChange?: boolean;
  /**
   * Whether the form should trigger the validation callbacks when form fields
   * are blurred.
   * @default true
   */
  validateOnBlur?: boolean;
  /**
   * Whether the form store should be reset when the form element gets
   * unmounted.
   * @default false
   */
  resetOnUnmount?: boolean;
  /**
   * Whether the form store should be reset when the form gets successfully
   * submitted.
   * @default true
   */
  resetOnSubmit?: boolean;
  /**
   * Whether the form should automatically focus the first invalid field when
   * the form gets submitted.
   * @default true
   */
  autoFocusOnSubmit?: boolean;
}

export type FormProps<T extends As = "form"> = Props<FormOptions<T>>;
