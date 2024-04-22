import type { ElementType, MouseEvent } from "react";
import { useCallback, useEffect, useState } from "react";
import type { StringLike } from "@ariakit/core/form/types";
import { invariant } from "@ariakit/core/utils/misc";
import type { ButtonOptions } from "../button/button.tsx";
import { useButton } from "../button/button.tsx";
import type { CollectionItemOptions } from "../collection/collection-item.tsx";
import { useCollectionItem } from "../collection/collection-item.tsx";
import { useEvent } from "../utils/hooks.ts";
import { createElement, createHook, forwardRef } from "../utils/system.tsx";
import type { Props } from "../utils/types.ts";
import { useFormContext } from "./form-context.tsx";
import type { FormStore, FormStoreState } from "./form-store.ts";

const TagName = "button" satisfies ElementType;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

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
export const useFormPush = createHook<TagName, FormPushOptions>(
  function useFormPush({
    store,
    value,
    name: nameProp,
    getItem: getItemProp,
    autoFocusOnClick = true,
    ...props
  }) {
    const context = useFormContext();
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "FormPush must be wrapped in a Form component.",
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

    const onClick = useEvent((event: MouseEvent<HTMLType>) => {
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
    props = useCollectionItem<TagName>({ store, ...props, getItem });

    return props;
  },
);

/**
 * Renders a button that will push items to an array value in the form store
 * when clicked.
 *
 * The [`name`](https://ariakit.org/reference/form-push#name) prop needs to be
 * provided to identify the array field. The
 * [`value`](https://ariakit.org/reference/form-push#value) prop is required to
 * define the value that will be added to the array.
 *
 * By default, the newly added input will be automatically focused when the
 * button is clicked unless the
 * [`autoFocusOnClick`](https://ariakit.org/reference/form-push#autofocusonclick)
 * prop is set to `false`.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx {13-15}
 * const form = useFormStore({
 *   defaultValues: {
 *     languages: ["JavaScript", "PHP"],
 *   },
 * });
 *
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
export const FormPush = forwardRef(function FormPush(props: FormPushProps) {
  const htmlProps = useFormPush(props);
  return createElement(TagName, htmlProps);
});

export interface FormPushOptions<T extends ElementType = TagName>
  extends ButtonOptions<T>,
    CollectionItemOptions<T> {
  /**
   * Object returned by the
   * [`useFormStore`](https://ariakit.org/reference/use-form-store) hook. If not
   * provided, the closest [`Form`](https://ariakit.org/reference/form) or
   * [`FormProvider`](https://ariakit.org/reference/form-provider) components'
   * context will be used.
   */
  store?: FormStore;
  /**
   * Name of the array field. This can either be a string or a reference to a
   * field name from the
   * [`names`](https://ariakit.org/reference/use-form-store#names) object in the
   * store, for type safety.
   */
  name: StringLike;
  /**
   * Value that will initially be assigned to the array item when it's pushed.
   */
  value: unknown;
  /**
   * Whether the newly added input should be automatically focused when the
   * button is clicked.
   * @default true
   */
  autoFocusOnClick?: boolean;
}

export type FormPushProps<T extends ElementType = TagName> = Props<
  T,
  FormPushOptions<T>
>;
