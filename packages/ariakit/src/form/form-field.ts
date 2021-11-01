import { FocusEvent, useCallback, useMemo, useRef } from "react";
import { useStore, createMemoComponent } from "ariakit-utils/store";
import { createHook, createElement } from "ariakit-utils/system";
import { As, Props } from "ariakit-utils/types";
import { cx } from "ariakit-utils/misc";
import {
  useEventCallback,
  useForkRef,
  useId,
  useTagName,
} from "ariakit-utils/hooks";
import {
  CollectionItemOptions,
  useCollectionItem,
} from "../collection/collection-item";
import { FormState } from "./form-state";
import { FormContext, StringLike } from "./__utils";

type ItemType = "label" | "error" | "description";

function acceptsNameAttribute(tagName?: string) {
  return (
    tagName === "input" ||
    tagName === "button" ||
    tagName === "textarea" ||
    tagName === "fieldset" ||
    tagName === "select"
  );
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
 * @see https://ariakit.org/docs/form
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
  ({ state, name: nameProp, ...props }) => {
    const name = `${nameProp}`;
    state = useStore(state || FormContext, [
      "setFieldTouched",
      "useValidate",
      "setError",
      useCallback((s: FormState) => s.getError(name), [name]),
      useCallback((s: FormState) => s.getFieldTouched(name), [name]),
      useCallback((s: FormState) => findItem(s.items, name, "label"), [name]),
      useCallback((s: FormState) => findItem(s.items, name, "error"), [name]),
      useCallback(
        (s: FormState) => findItem(s.items, name, "description"),
        [name]
      ),
    ]);

    const ref = useRef<HTMLInputElement>(null);
    const id = useId(props.id);

    state?.useValidate(() => {
      const element = ref.current;
      if (!element) return;
      if ("validity" in element && !element.validity.valid) {
        state?.setError(name, element.validationMessage);
      }
    });

    const getItem = useCallback(
      (item) => {
        const nextItem = { ...item, id, name, type: "field" };
        if (props.getItem) {
          return props.getItem(nextItem);
        }
        return nextItem;
      },
      [id, name, props.getItem]
    );

    const onBlurProp = useEventCallback(props.onBlur);

    const onBlur = useCallback(
      (event: FocusEvent<HTMLInputElement>) => {
        onBlurProp(event);
        if (event.defaultPrevented) return;
        state?.setFieldTouched(name, true);
      },
      [onBlurProp, state?.setFieldTouched, name]
    );

    const tagName = useTagName(ref, props.as || "input");

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
      "aria-invalid": invalid ? true : undefined,
      ...props,
      "aria-describedby": describedBy || undefined,
      // @ts-expect-error
      name: acceptsNameAttribute(tagName) ? name : undefined,
      ref: useForkRef(ref, props.ref),
      onBlur,
    };

    props = useCollectionItem({ state, ...props, getItem });

    return props;
  }
);

/**
 * A component that renders a form field. Unlike `FormInput`, this component
 * doesn't automatically pass the `value` and `onChange` props down to the
 * underlying element. This is so we can use it not only for native form
 * elements but also for custom components whose value is not controlled by the
 * native `value` and `onChange` props.
 * @see https://ariakit.org/docs/form
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
};

export type FormFieldProps<T extends As = "input"> = Props<FormFieldOptions<T>>;
