import { FocusEvent, RefObject, useCallback, useMemo, useRef } from "react";
import { getDocument } from "ariakit-utils/dom";
import {
  useBooleanEvent,
  useEvent,
  useForkRef,
  useId,
} from "ariakit-utils/hooks";
import { cx } from "ariakit-utils/misc";
import { createMemoComponent, useStore } from "ariakit-utils/store";
import { createElement, createHook } from "ariakit-utils/system";
import { As, BooleanOrCallback, Props } from "ariakit-utils/types";
import {
  CollectionItemOptions,
  useCollectionItem,
} from "../collection/collection-item";
import { FormContext, StringLike } from "./__utils";
import { FormState } from "./form-state";

type ItemType = "label" | "error" | "description";

function getNamedElement(ref: RefObject<HTMLInputElement>, name: string) {
  const element = ref.current;
  if (!element) return null;
  if (element.name !== name) {
    if (element.form) {
      return element.form.elements.namedItem(name) as HTMLInputElement | null;
    } else {
      const document = getDocument(element);
      return document.getElementsByName(name)[0] as HTMLInputElement | null;
    }
  }
  return element;
}

function findItem(
  items: FormState["items"] | undefined,
  name: string,
  type: ItemType
) {
  return items?.find((item) => item.type === type && item.name === name);
}

function useItem(state: FormState | undefined, name: string, type: ItemType) {
  return useMemo(
    () => findItem(state?.items, name, type),
    [state?.items, name, type]
  );
}

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a form field. Unlike `useFormInput`, this hook
 * doesn't automatically returns the `value` and `onChange` props. This is so we
 * can use it not only for native form elements but also for custom components
 * whose value is not controlled by the native `value` and `onChange` props.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx
 * const state = useFormState({ defaultValues: { content: "" } });
 * const props = useFormField({ state, name: state.names.content });
 *
 * const setValue = useCallback((value) => {
 *   state.setValue(state.names.content, value);
 * }, [state.setValue, state.names.content]);
 *
 * <Form state={state}>
 *   <FormLabel name={state.names.content}>Content</FormLabel>
 *   <Role
 *     {...props}
 *     as={Editor}
 *     value={state.values.content}
 *     onChange={setValue}
 *   />
 * </Form>
 * ```
 */
export const useFormField = createHook<FormFieldOptions>(
  ({
    state,
    name: nameProp,
    getItem: getItemProp,
    touchOnBlur = true,
    ...props
  }) => {
    const name = `${nameProp}`;
    state = useStore(state || FormContext, [
      "setFieldTouched",
      "useValidate",
      "setError",
      useCallback((s: FormState) => s.getError(name), [name]),
      useCallback((s: FormState) => s.getFieldTouched(name).toString(), [name]),
      useCallback((s: FormState) => findItem(s.items, name, "label"), [name]),
      useCallback((s: FormState) => findItem(s.items, name, "error"), [name]),
      useCallback(
        (s: FormState) => findItem(s.items, name, "description"),
        [name]
      ),
    ]);

    const ref = useRef<HTMLInputElement>(null);
    const id = useId(props.id);

    state?.useValidate(async () => {
      const element = getNamedElement(ref, name);
      if (!element) return;
      // Flush microtasks to make sure the validity state is up to date
      await Promise.resolve();
      if ("validity" in element && !element.validity.valid) {
        state?.setError(name, element.validationMessage);
      }
    });

    const getItem = useCallback<NonNullable<CollectionItemOptions["getItem"]>>(
      (item) => {
        const nextItem = { ...item, id, name, type: "field" };
        if (getItemProp) {
          return getItemProp(nextItem);
        }
        return nextItem;
      },
      [id, name, getItemProp]
    );

    const onBlurProp = props.onBlur;
    const touchOnBlurProp = useBooleanEvent(touchOnBlur);

    const onBlur = useEvent((event: FocusEvent<HTMLInputElement>) => {
      onBlurProp?.(event);
      if (event.defaultPrevented) return;
      if (!touchOnBlurProp(event)) return;
      state?.setFieldTouched(name, true);
    });

    const label = useItem(state, name, "label");
    const error = useItem(state, name, "error");
    const description = useItem(state, name, "description");
    const describedBy = cx(
      error?.id,
      description?.id,
      props["aria-describedby"]
    );

    const invalid = !!state?.getError(name) && state.getFieldTouched(name);

    props = {
      id,
      "aria-labelledby": label?.id,
      "aria-invalid": invalid,
      ...props,
      "aria-describedby": describedBy || undefined,
      ref: useForkRef(ref, props.ref),
      onBlur,
    };

    props = useCollectionItem({ state, ...props, name, getItem });

    return props;
  }
);

/**
 * A component that renders a form field. Unlike `FormInput`, this component
 * doesn't automatically pass the `value` and `onChange` props down to the
 * underlying element. This is so we can use it not only for native form
 * elements but also for custom components whose value is not controlled by the
 * native `value` and `onChange` props.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx
 * const form = useFormState({ defaultValues: { content: "" } });
 *
 * const setValue = useCallback((value) => {
 *   form.setValue(form.names.content, value);
 * }, [form.setValue, form.names.content]);
 *
 * <Form state={form}>
 *   <FormLabel name={form.names.content}>Content</FormLabel>
 *   <FormField
 *     {...props}
 *     as={Editor}
 *     value={form.values.content}
 *     onChange={setValue}
 *   />
 * </Form>
 * ```
 */
export const FormField = createMemoComponent<FormFieldOptions>((props) => {
  const htmlProps = useFormField(props);
  return createElement("input", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  FormField.displayName = "FormField";
}

export type FormFieldOptions<T extends As = "input"> = Omit<
  CollectionItemOptions<T>,
  "state"
> & {
  /**
   * Object returned by the `useFormState` hook. If not provided, the parent
   * `Form` component's context will be used.
   */
  state?: FormState;
  /**
   * Name of the field.
   */
  name: StringLike;
  /**
   * Whether the field should be marked touched on blur.
   * @default true
   */
  touchOnBlur?: BooleanOrCallback<FocusEvent>;
};

export type FormFieldProps<T extends As = "input"> = Props<FormFieldOptions<T>>;
