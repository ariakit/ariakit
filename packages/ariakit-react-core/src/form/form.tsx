import { isTextField } from "@ariakit/core/utils/dom";
import { invariant } from "@ariakit/core/utils/misc";
import type {
  ElementType,
  FocusEvent,
  SubmitEvent,
  SyntheticEvent,
} from "react";
import { useEffect, useRef, useState } from "react";
import {
  useEvent,
  useInitialValue,
  useMergeRefs,
  useTagName,
  useUpdateEffect,
  useWrapElement,
} from "../utils/hooks.ts";
import { useStoreState } from "../utils/store.tsx";
import { createElement, createHook, forwardRef } from "../utils/system.tsx";
import type { Options, Props } from "../utils/types.ts";
import { FormScopedContextProvider, useFormContext } from "./form-context.tsx";
import type { FormStore, FormStoreState } from "./form-store.ts";

const TagName = "form" satisfies ElementType;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

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
 * @see https://ariakit.com/components/form
 * @example
 * ```jsx
 * const store = useFormStore();
 * const props = useForm({ store, render: <form /> });
 * <Role {...props} />
 * ```
 */
export const useForm = createHook<TagName, FormOptions>(function useForm({
  store,
  validateOnChange = true,
  validateOnBlur = true,
  resetOnUnmount = false,
  resetOnSubmit = true,
  autoFocusOnSubmit = true,
  ...props
}) {
  const context = useFormContext();
  store = store || context;

  invariant(
    store,
    process.env.NODE_ENV !== "production" &&
      "Form must receive a `store` prop or be wrapped in a FormProvider component.",
  );

  const ref = useRef<HTMLType>(null);
  const values = useStoreState(store, "values");
  const submitSucceed = useStoreState(store, "submitSucceed");
  const submitFailed = useStoreState(store, "submitFailed");
  const items = useStoreState(store, "items");
  const defaultValues = useInitialValue(values);

  useEffect(
    () => (resetOnUnmount ? store?.reset : undefined),
    [resetOnUnmount, store],
  );

  useUpdateEffect(() => {
    if (!validateOnChange) return;
    if (values === defaultValues) return;
    void store?.validate();
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
    // oxlint-disable-next-line exhaustive-deps
  }, [autoFocusOnSubmit, submitFailed, items]);

  const onSubmitProp = props.onSubmit;

  const onSubmit = useEvent((event: SubmitEvent<HTMLType>) => {
    onSubmitProp?.(event);
    if (event.defaultPrevented) return;
    event.preventDefault();
    void store?.submit();
    if (!autoFocusOnSubmit) return;
    setShouldFocusOnSubmit(true);
  });

  const onBlurProp = props.onBlur;

  const onBlur = useEvent((event: FocusEvent<HTMLType>) => {
    onBlurProp?.(event);
    if (event.defaultPrevented) return;
    if (!validateOnBlur) return;
    if (!store) return;
    if (!isField(event.target, store.getState().items)) return;
    void store.validate();
  });

  const onResetProp = props.onReset;

  const onReset = useEvent((event: SyntheticEvent<HTMLType>) => {
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

  const tagName = useTagName(ref, TagName);

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
});

/**
 * Renders a form element and provides a [form
 * store](https://ariakit.com/reference/use-form-store) to its controls.
 *
 * The form is automatically validated on change and on blur. This behavior can
 * be disabled with the
 * [`validateOnChange`](https://ariakit.com/reference/form#validateonchange) and
 * [`validateOnBlur`](https://ariakit.com/reference/form#validateonblur) props.
 *
 * When the form is submitted with errors, the first invalid field is
 * automatically focused thanks to the
 * [`autoFocusOnSubmit`](https://ariakit.com/reference/form#autofocusonsubmit)
 * prop. If it's successful, the
 * [`resetOnSubmit`](https://ariakit.com/reference/form#resetonsubmit) prop
 * ensures the form is reset to its initial values as defined by the
 * [`defaultValues`](https://ariakit.com/reference/use-form-store#defaultvalues)
 * option on the [store](https://ariakit.com/reference/use-form-store).
 * @see https://ariakit.com/components/form
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
  return createElement(TagName, htmlProps);
});

export interface FormOptions<_T extends ElementType = TagName> extends Options {
  /**
   * Object returned by the
   * [`useFormStore`](https://ariakit.com/reference/use-form-store) hook. If not
   * provided, the closest
   * [`FormProvider`](https://ariakit.com/reference/form-provider) component's
   * context will be used.
   */
  store?: FormStore;
  /**
   * Determines if the form should invoke the validation callbacks registered
   * with
   * [`useValidate`](https://ariakit.com/reference/use-form-store#usevalidate)
   * when the [`values`](https://ariakit.com/reference/use-form-store#values)
   * change.
   * @default true
   */
  validateOnChange?: boolean;
  /**
   * Determines if the form should invoke the validation callbacks registered
   * with
   * [`useValidate`](https://ariakit.com/reference/use-form-store#usevalidate)
   * when a field loses focus.
   * @default true
   */
  validateOnBlur?: boolean;
  /**
   * Determines if the form state should reset to its
   * [`defaultValues`](https://ariakit.com/reference/use-form-store#defaultvalues)
   * when the [`Form`](https://ariakit.com/reference/form) component is
   * unmounted.
   * @default false
   */
  resetOnUnmount?: boolean;
  /**
   * Determines if the form state should be reset to its
   * [`defaultValues`](https://ariakit.com/reference/use-form-store#defaultvalues)
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

export type FormProps<T extends ElementType = TagName> = Props<
  T,
  FormOptions<T>
>;
