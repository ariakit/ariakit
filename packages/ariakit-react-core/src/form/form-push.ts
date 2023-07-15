import type { MouseEvent } from "react";
import { useCallback, useContext, useEffect, useState } from "react";
import type { StringLike } from "@ariakit/core/form/types";
import { invariant } from "@ariakit/core/utils/misc";
import type { ButtonOptions } from "../button/button.js";
import { useButton } from "../button/button.js";
import type { CollectionItemOptions } from "../collection/collection-item.js";
import { useCollectionItem } from "../collection/collection-item.js";
import { useEvent } from "../utils/hooks.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import { FormContext } from "./form-context.js";
import type { FormStore, FormStoreState } from "./form-store.js";

function getFirstFieldsByName(
  items: FormStoreState["items"] | undefined,
  name: string,
) {
  if (!items) return [];
  const fields: FormStoreState["items"] = [];
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
 * Returns props to create a `FormPush` component.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx
 * const store = useFormStore({
 *   defaultValues: {
 *     languages: ["JavaScript", "PHP"],
 *   },
 * });
 * const props = useFormPush({
 *   store,
 *   name: store.names.languages,
 *   value: "",
 * });
 * const values = store.useState("values");
 *
 * <Form store={store}>
 *   {values.languages.map((_, i) => (
 *     <FormInput key={i} name={store.names.languages[i]} />
 *   ))}
 *   <Role {...props}>Add new language</Role>
 * </Form>
 * ```
 */
export const useFormPush = createHook<FormPushOptions>(
  ({
    store,
    value,
    name: nameProp,
    getItem: getItemProp,
    autoFocusOnClick = true,
    ...props
  }) => {
    const context = useContext(FormContext);
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "FormPush must be wrapped in a Form component",
    );

    const name = `${nameProp}`;
    const [shouldFocus, setShouldFocus] = useState(false);

    useEffect(() => {
      if (!shouldFocus) return;
      const items = getFirstFieldsByName(store?.getState().items, name);
      const element = items?.[items.length - 1]?.element;
      if (!element) return;
      element.focus();
      setShouldFocus(false);
    }, [store, shouldFocus, name]);

    const getItem = useCallback<NonNullable<CollectionItemOptions["getItem"]>>(
      (item) => {
        const nextItem = { ...item, type: "button", name };
        if (getItemProp) {
          return getItemProp(nextItem);
        }
        return nextItem;
      },
      [name, getItemProp],
    );

    const onClickProp = props.onClick;

    const onClick = useEvent((event: MouseEvent<HTMLButtonElement>) => {
      onClickProp?.(event);
      if (event.defaultPrevented) return;
      store?.pushValue(name, value);
      if (!autoFocusOnClick) return;
      setShouldFocus(true);
    });

    props = {
      ...props,
      onClick,
    };

    props = useButton(props);
    props = useCollectionItem({ store, ...props, getItem });

    return props;
  },
);

/**
 * Renders a button that will push items to an array value in the form store
 * when clicked.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx
 * const form = useFormStore({
 *   defaultValues: {
 *     languages: ["JavaScript", "PHP"],
 *   },
 * });
 * const values = form.useState("values");
 *
 * <Form store={form}>
 *   {values.languages.map((_, i) => (
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

if (process.env.NODE_ENV !== "production") {
  FormPush.displayName = "FormPush";
}

export interface FormPushOptions<T extends As = "button">
  extends ButtonOptions<T>,
    CollectionItemOptions<T> {
  /**
   * Object returned by the `useFormStore` hook. If not provided, the parent
   * `Form` component's context will be used.
   */
  store?: FormStore;
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
}

export type FormPushProps<T extends As = "button"> = Props<FormPushOptions<T>>;
