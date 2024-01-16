import type { FocusEvent, FormEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { isTextField } from "@ariakit/core/utils/dom";
import { invariant } from "@ariakit/core/utils/misc";
import {
  useEvent,
  useInitialValue,
  useMergeRefs,
  useTagName,
  useUpdateEffect,
  useWrapElement,
} from "../utils/hooks.js";
import { createElement, createHook2 } from "../utils/system.js";
import type { As, Options, Props } from "../utils/types.js";
import { FormScopedContextProvider, useFormContext } from "./form-context.js";
import type { FormStore, FormStoreState } from "./form-store.js";

function isField(element: HTMLElement, items: FormStoreState["items"]) {
  return items.some(
    (item) => item.type === "field" && item.element === element,
  );
}

function getFirstInvalidField(items: FormStoreState["items"]) {
  return items.find(
    (item) =>
      item.type === "field" &&
      item.element?.getAttribute("aria-invalid") === "true",
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
export const useForm = createHook2<TagName, FormOptions>(
  ({
    store,
    validateOnChange = true,
    validateOnBlur = true,
    resetOnUnmount = false,
    resetOnSubmit = true,
    autoFocusOnSubmit = true,
    ...props
  }) => {
    const context = useFormContext();
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "Form must receive a `store` prop or be wrapped in a FormProvider component.",
    );

    const ref = useRef<HTMLFormElement>(null);
    const values = store.useState("values");
    const submitSucceed = store.useState("submitSucceed");
    const submitFailed = store.useState("submitFailed");
    const items = store.useState("items");
    const defaultValues = useInitialValue(values);

    useEffect(
      () => (resetOnUnmount ? store?.reset : undefined),
      [resetOnUnmount, store],
    );

    useUpdateEffect(() => {
      if (!validateOnChange) return;
      if (values === defaultValues) return;
      store?.validate();
    }, [validateOnChange, values, defaultValues, store]);

    useEffect(() => {
      if (!resetOnSubmit) return;
      if (!submitSucceed) return;
      store?.reset();
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
      store?.submit();
      if (!autoFocusOnSubmit) return;
      setShouldFocusOnSubmit(true);
    });

    const onBlurProp = props.onBlur;

    const onBlur = useEvent((event: FocusEvent<HTMLFormElement>) => {
      onBlurProp?.(event);
      if (event.defaultPrevented) return;
      if (!validateOnBlur) return;
      if (!store) return;
      if (!isField(event.target, store.getState().items)) return;
      store.validate();
    });

    const onResetProp = props.onReset;

    const onReset = useEvent((event: FormEvent<HTMLFormElement>) => {
      onResetProp?.(event);
      if (event.defaultPrevented) return;
      event.preventDefault();
      store?.reset();
    });

    props = useWrapElement(
      props,
      (element) => (
        <FormScopedContextProvider value={store}>
          {element}
        </FormScopedContextProvider>
      ),
      [store],
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
  },
);

/**
 * Renders a form element and provides a [form
 * store](https://ariakit.org/reference/use-form-store) to its controls.
 *
 * The form is automatically validated on change and on blur. This behavior can
 * be disabled with the
 * [`validateOnChange`](https://ariakit.org/reference/form#validateonchange) and
 * [`validateOnBlur`](https://ariakit.org/reference/form#validateonblur) props.
 *
 * When the form is submitted with errors, the first invalid field is
 * automatically focused thanks to the
 * [`autoFocusOnSubmit`](https://ariakit.org/reference/form#autofocusonsubmit)
 * prop. If it's successful, the
 * [`resetOnSubmit`](https://ariakit.org/reference/form#resetonsubmit) prop
 * ensures the form is reset to its initial values as defined by the
 * [`defaultValues`](https://ariakit.org/reference/use-form-store#defaultvalues)
 * option on the [store](https://ariakit.org/reference/use-form-store).
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx {5-8}
 * const form = useFormStore({
 *   defaultValues: { username: "johndoe" },
 * });
 *
 * <Form store={form}>
 *   <FormLabel name={form.names.username}>Username</FormLabel>
 *   <FormInput name={form.names.username} />
 * </Form>
 * ```
 */
export const Form = forwardRef(function Form(props: FormProps) {
  const htmlProps = useForm(props);
  return createElement("form", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  Form.displayName = "Form";
}

export interface FormOptions<T extends As = "form"> extends Options<T> {
  /**
   * Object returned by the
   * [`useFormStore`](https://ariakit.org/reference/use-form-store) hook. If not
   * provided, the closest
   * [`FormProvider`](https://ariakit.org/reference/form-provider) component's
   * context will be used.
   */
  store?: FormStore;
  /**
   * Determines if the form should invoke the validation callbacks registered
   * with
   * [`useValidate`](https://ariakit.org/reference/use-form-store#usevalidate)
   * when the [`values`](https://ariakit.org/reference/use-form-store#values)
   * change.
   * @default true
   */
  validateOnChange?: boolean;
  /**
   * Determines if the form should invoke the validation callbacks registered
   * with
   * [`useValidate`](https://ariakit.org/reference/use-form-store#usevalidate)
   * when a field loses focus.
   * @default true
   */
  validateOnBlur?: boolean;
  /**
   * Determines if the form state should reset to its
   * [`defaultValues`](https://ariakit.org/reference/use-form-store#defaultvalues)
   * when the [`Form`](https://ariakit.org/reference/form) component is
   * unmounted.
   * @default false
   */
  resetOnUnmount?: boolean;
  /**
   * Determines if the form state should be reset to its
   * [`defaultValues`](https://ariakit.org/reference/use-form-store#defaultvalues)
   * upon successful form submission.
   * @default true
   */
  resetOnSubmit?: boolean;
  /**
   * Determines if the form should automatically focus on the first invalid
   * field when the form is submitted.
   * @default true
   */
  autoFocusOnSubmit?: boolean;
}

export type FormProps<T extends As = "form"> = Props<FormOptions<T>>;
