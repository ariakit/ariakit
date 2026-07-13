import type { StringLike } from "@ariakit/components/form/types";
import { useStoreState } from "@ariakit/react-store";
import {
  useEvent,
  createElement,
  createHook,
  forwardRef,
} from "@ariakit/react-utils";
import type { Props } from "@ariakit/react-utils";
import type { ElementType, MouseEvent } from "react";
import { useCallback, useEffect, useState } from "react";
import type { ButtonOptions } from "../button/button.tsx";
import { useButton } from "../button/button.tsx";
import { withDefaultButtonType } from "../button/utils.ts";
import type { CollectionItemOptions } from "../collection/collection-item.tsx";
import { useCollectionItem } from "../collection/collection-item.tsx";
import { useFormItemContext } from "./form-context.tsx";
import type { FormStore, FormStoreState } from "./form-store.ts";
import { getArrayFieldIndex } from "./utils.ts";

const TagName = "button" satisfies ElementType;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

function findFirstFieldByNameAndIndex(
  items: FormStoreState["items"] | undefined,
  name: string,
  index: number,
) {
  return items?.find(
    (item) =>
      item.type === "field" && getArrayFieldIndex(item.name, name) === index,
  );
}

/**
 * Returns props to create a `FormPush` component.
 * @see https://ariakit.com/components/form
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
 * const values = useStoreState(store, "values");
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
    const { store: form, name } = useFormItemContext({
      store,
      name: nameProp,
      component: "FormPush",
    });
    const items = useStoreState(form, "items");
    const [focusIndex, setFocusIndex] = useState<number | null>(null);

    useEffect(() => {
      if (focusIndex == null) return;
      const item = findFirstFieldByNameAndIndex(items, name, focusIndex);
      const element = item?.element;
      // Field registration is published to `items` asynchronously. Keep the
      // requested index pending until the new field appears.
      if (!element) return;
      element.focus();
      setFocusIndex(null);
    }, [items, focusIndex, name]);

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
      const length = form.getValue<unknown[]>(name)?.length ?? 0;
      form.pushValue(name, value);
      if (!autoFocusOnClick) return;
      setFocusIndex(length);
    });

    props = {
      ...props,
      onClick,
    };

    props = useButton(props);
    props = useCollectionItem<TagName>({ store: form, ...props, getItem });

    return props;
  },
);

/**
 * Renders a button that will push items to an array value in the form store
 * when clicked.
 *
 * The [`name`](https://ariakit.com/reference/form-push#name) prop needs to be
 * provided to identify the array field. The
 * [`value`](https://ariakit.com/reference/form-push#value) prop is required to
 * define the value that will be added to the array.
 *
 * By default, the newly added input will be automatically focused when the
 * button is clicked unless the
 * [`autoFocusOnClick`](https://ariakit.com/reference/form-push#autofocusonclick)
 * prop is set to `false`.
 * @see https://ariakit.com/components/form
 * @example
 * ```jsx {13-15}
 * const form = useFormStore({
 *   defaultValues: {
 *     languages: ["JavaScript", "PHP"],
 *   },
 * });
 *
 * const values = useStoreState(form, "values");
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
  const htmlProps = useFormPush(withDefaultButtonType(props));
  return createElement(TagName, htmlProps);
});

export interface FormPushOptions<T extends ElementType = TagName>
  extends ButtonOptions<T>, CollectionItemOptions<T> {
  /**
   * Object returned by the
   * [`useFormStore`](https://ariakit.com/reference/use-form-store) hook. If not
   * provided, the closest [`Form`](https://ariakit.com/reference/form) or
   * [`FormProvider`](https://ariakit.com/reference/form-provider) components'
   * context will be used.
   */
  store?: FormStore;
  /**
   * Name of the array field. This can either be a string or a reference to a
   * field name from the
   * [`names`](https://ariakit.com/reference/use-form-store#names) object in the
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
