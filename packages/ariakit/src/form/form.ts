import {
  FocusEvent,
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { isTextField } from "ariakit-utils/dom";
import {
  useEventCallback,
  useForkRef,
  useTagName,
  useUpdateEffect,
} from "ariakit-utils/hooks";
import { useStoreProvider } from "ariakit-utils/store";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { As, Options, Props } from "ariakit-utils/types";
import { FormContext } from "./__utils";
import { FormState } from "./form-state";

function isField(element: HTMLElement, items: FormState["items"]) {
  return items.some(
    (item) => item.type === "field" && item.ref.current === element
  );
}

function getFirstInvalidField(items: FormState["items"]) {
  return items.find(
    (item) =>
      item.type === "field" &&
      item.ref.current?.getAttribute("aria-invalid") === "true"
  );
}

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a form element.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx
 * const state = useFormState();
 * const props = useForm({ state, as: "form" });
 * <Role {...props} />
 * ```
 */
export const useForm = createHook<FormOptions>(
  ({
    state,
    validateOnChange = true,
    validateOnBlur = true,
    resetOnUnmount = false,
    resetOnSubmit = true,
    autoFocusOnSubmit = true,
    ...props
  }) => {
    const ref = useRef<HTMLFormElement>(null);

    useEffect(
      () => (resetOnUnmount ? state.reset : undefined),
      [resetOnUnmount, state.reset]
    );

    useUpdateEffect(() => {
      if (validateOnChange) {
        state.validate();
      }
    }, [state.values, validateOnChange, state.validate]);

    useEffect(() => {
      if (!resetOnSubmit) return;
      if (!state.submitSucceed) return;
      state.reset();
    }, [resetOnSubmit, state.submitSucceed, state.reset]);

    const [shouldFocusOnSubmit, setShouldFocusOnSubmit] = useState(false);

    useEffect(() => {
      if (!shouldFocusOnSubmit) return;
      if (!state.submitFailed) return;
      const field = getFirstInvalidField(state.items);
      const element = field?.ref.current;
      if (!element) return;
      setShouldFocusOnSubmit(false);
      element.focus();
      if (isTextField(element)) {
        element.select();
      }
    }, [autoFocusOnSubmit, state.submitFailed, state.items]);

    const onSubmitProp = useEventCallback(props.onSubmit);

    const onSubmit = useCallback(
      (event: FormEvent<HTMLFormElement>) => {
        onSubmitProp(event);
        if (event.defaultPrevented) return;
        event.preventDefault();
        state.submit();
        if (!autoFocusOnSubmit) return;
        setShouldFocusOnSubmit(true);
      },
      [onSubmitProp, state.submit, autoFocusOnSubmit]
    );

    const onBlurProp = useEventCallback(props.onBlur);

    const onBlur = useCallback(
      (event: FocusEvent<HTMLFormElement>) => {
        onBlurProp(event);
        if (event.defaultPrevented) return;
        if (!validateOnBlur) return;
        if (!isField(event.target, state.items)) return;
        state.validate();
      },
      [onBlurProp, validateOnBlur, state.items, state.validate]
    );

    const tagName = useTagName(ref, props.as || "form");

    props = {
      role: tagName !== "form" ? "form" : undefined,
      noValidate: true,
      ...props,
      ref: useForkRef(ref, props.ref),
      onSubmit,
      onBlur,
    };

    props = useStoreProvider({ state, ...props }, FormContext);

    return props;
  }
);

/**
 * A component that renders a form element.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx
 * const form = useFormState({ defaultValues: { username: "johndoe" } });
 * <Form state={form}>
 *   <FormLabel name={form.names.username}>Username</FormLabel>
 *   <FormInput name={form.names.username} />
 * </Form>
 * ```
 */
export const Form = createComponent<FormOptions>((props) => {
  const htmlProps = useForm(props);
  return createElement("form", htmlProps);
});

export type FormOptions<T extends As = "form"> = Options<T> & {
  /**
   * Object returned by the `useFormState` hook.
   */
  state: FormState;
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
   * Whether the form state should be reset when the form element gets
   * unmounted.
   * @default false
   */
  resetOnUnmount?: boolean;
  /**
   * Whether the form state should be reset when the form gets successfully
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
};

export type FormProps<T extends As = "form"> = Props<FormOptions<T>>;
