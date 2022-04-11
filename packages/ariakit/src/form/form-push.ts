import { MouseEvent, useCallback, useEffect, useState } from "react";
import { useEventCallback, useLiveRef } from "ariakit-utils/hooks";
import { useStore } from "ariakit-utils/store";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { As, Props } from "ariakit-utils/types";
import { ButtonOptions, useButton } from "../button";
import {
  CollectionItemOptions,
  useCollectionItem,
} from "../collection/collection-item";
import { FormContext, StringLike } from "./__utils";
import { FormState } from "./form-state";

function getFirstFieldsByName(
  items: FormState["items"] | undefined,
  name: string
) {
  if (!items) return [];
  const fields: FormState["items"] = [];
  for (const item of items) {
    if (item.type !== "field") continue;
    if (!item.name.startsWith(name)) continue;
    const nameWithIndex = item.name.replace(/(\.\d+)\..+$/, "$1");
    const regex = new RegExp(`^${nameWithIndex}`);
    if (!fields.some((i) => regex.test(i.name))) {
      fields.push(item);
    }
  }
  return fields;
}

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a button that will push items to an array field
 * in the form when clicked.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx
 * const state = useFormState({
 *   defaultValues: {
 *     languages: ["JavaScript", "PHP"],
 *   },
 * });
 * const props = useFormPush({
 *   state,
 *   name: state.names.languages,
 *   value: "",
 * });
 * <Form state={state}>
 *   {state.values.languages.map((_, i) => (
 *     <FormInput key={i} name={state.names.languages[i]} />
 *   ))}
 *   <Role {...props}>Add new language</Role>
 * </Form>
 * ```
 */
export const useFormPush = createHook<FormPushOptions>(
  ({
    state,
    value,
    name: nameProp,
    getItem: getItemProp,
    autoFocusOnClick = true,
    ...props
  }) => {
    const name = `${nameProp}`;
    state = useStore(state || FormContext, ["pushValue", "items"]);

    const [shouldFocus, setShouldFocus] = useState(false);

    useEffect(() => {
      if (!shouldFocus) return;
      const items = getFirstFieldsByName(state?.items, name);
      const element = items?.[items.length - 1]?.ref.current;
      if (!element) return;
      element.focus();
      setShouldFocus(false);
    }, [shouldFocus, state?.items, name]);

    const getItem = useCallback(
      (item) => {
        const nextItem = { ...item, type: "button", name };
        if (getItemProp) {
          return getItemProp(nextItem);
        }
        return nextItem;
      },
      [name, getItemProp]
    );

    const onClickProp = useEventCallback(props.onClick);
    const valueRef = useLiveRef(value);

    const onClick = useCallback(
      (event: MouseEvent<HTMLButtonElement>) => {
        onClickProp(event);
        if (event.defaultPrevented) return;
        state?.pushValue(name, valueRef.current);
        if (!autoFocusOnClick) return;
        setShouldFocus(true);
      },
      [onClickProp, state?.pushValue, name, valueRef, autoFocusOnClick]
    );

    props = {
      ...props,
      onClick,
    };

    props = useButton(props);
    props = useCollectionItem({ state, ...props, getItem });

    return props;
  }
);

/**
 * A component that renders a button that will push items to an array value in
 * the form state when clicked.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx
 * const form = useFormState({
 *   defaultValues: {
 *     languages: ["JavaScript", "PHP"],
 *   },
 * });
 * <Form state={form}>
 *   {form.values.languages.map((_, i) => (
 *     <FormInput key={i} name={form.names.languages[i]} />
 *   ))}
 *   <FormPush name={form.names.languages} value="">
 *     Add new language
 *   </FormPush>
 * </Form>
 * ```
 */
export const FormPush = createComponent<FormPushOptions>((props) => {
  const htmlProps = useFormPush(props);
  return createElement("button", htmlProps);
});

export type FormPushOptions<T extends As = "button"> = ButtonOptions<T> &
  Omit<CollectionItemOptions<T>, "state"> & {
    /**
     * Object returned by the `useFormState` hook. If not provided, the parent
     * `Form` component's context will be used.
     */
    state?: FormState;
    /**
     * Name of the array field.
     */
    name: StringLike;
    /**
     * Value that will be initially set to the item when it is pushed.
     */
    value: unknown;
    /**
     * Whether the newly added input should be automatically focused when the
     * button is clicked.
     * @default true
     */
    autoFocusOnClick?: boolean;
  };

export type FormPushProps<T extends As = "button"> = Props<FormPushOptions<T>>;
