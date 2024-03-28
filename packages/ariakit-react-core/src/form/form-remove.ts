import type { ElementType, MouseEvent } from "react";
import type { StringLike } from "@ariakit/core/form/types";
import { isTextField } from "@ariakit/core/utils/dom";
import { invariant } from "@ariakit/core/utils/misc";
import type { ButtonOptions } from "../button/button.ts";
import { useButton } from "../button/button.ts";
import { useEvent } from "../utils/hooks.ts";
import { createElement, createHook, forwardRef } from "../utils/system.tsx";
import type { Props } from "../utils/types.ts";
import { useFormContext } from "./form-context.tsx";
import type { FormStore, FormStoreState } from "./form-store.ts";

const TagName = "button" satisfies ElementType;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

function findNextOrPreviousField(
  items: FormStoreState["items"] | undefined,
  name: string,
  index: number,
) {
  const fields = items?.filter(
    (item) => item.type === "field" && item.name.startsWith(name),
  );
  const regex = new RegExp(`^${name}\\.(\\d+)`);
  const nextField = fields?.find((field) => {
    const fieldIndex = field.name.replace(regex, "$1");
    return parseInt(fieldIndex) > index;
  });
  if (nextField) return nextField;
  return fields?.reverse().find((field) => {
    const fieldIndex = field.name.replace(regex, "$1");
    return parseInt(fieldIndex) < index;
  });
}

function findPushButton(
  items: FormStoreState["items"] | undefined,
  name: string,
) {
  return items?.find((item) => item.type === "button" && item.name === name);
}

/**
 * Returns props to create a `FormRemove` component.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx
 * const store = useFormStore({
 *   defaultValues: {
 *     languages: ["JavaScript", "PHP"],
 *   },
 * });
 * const props = useFormRemove({
 *   store,
 *   name: store.names.languages,
 *   index: 0,
 * });
 * const values = store.useState("values");
 *
 * <Form store={store}>
 *   {values.languages.map((_, i) => (
 *     <FormInput key={i} name={store.names.languages[i]} />
 *   ))}
 *   <Role {...props}>Remove first language</Role>
 * </Form>
 * ```
 */
export const useFormRemove = createHook<TagName, FormRemoveOptions>(
  function useFormRemove({
    store,
    name: nameProp,
    index,
    autoFocusOnClick = true,
    ...props
  }) {
    const context = useFormContext();
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "FormRemove must be wrapped in a Form component.",
    );

    const name = `${nameProp}`;
    const onClickProp = props.onClick;

    const onClick = useEvent((event: MouseEvent<HTMLType>) => {
      onClickProp?.(event);
      if (event.defaultPrevented) return;
      if (!store) return;
      store.removeValue(name, index);
      if (!autoFocusOnClick) return;
      const { items } = store.getState();
      const item = findNextOrPreviousField(items, name, index);
      const element = item?.element;
      if (element) {
        element.focus();
        if (isTextField(element)) {
          element.select();
        }
      } else {
        const pushButton = findPushButton(items, name);
        pushButton?.element?.focus();
      }
    });

    props = {
      ...props,
      onClick,
    };

    props = useButton(props);

    return props;
  },
);

/**
 * Renders a button that will remove an item from an array field in the form
 * when clicked.
 *
 * The [`name`](https://ariakit.org/reference/form-remove#name) prop must be
 * provided to identify the array field. Similarly, the
 * [`index`](https://ariakit.org/reference/form-remove#index) prop is required
 * to pinpoint the item to remove.
 *
 * By default, the button will automatically move focus to the next field in the
 * form when clicked, or to the previous field if there isn't a next field. This
 * behavior can be disabled by setting the
 * [`autoFocusOnClick`](https://ariakit.org/reference/form-remove#autofocusonclick)
 * prop to `false`.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx {13}
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
 *     <div key={i}>
 *       <FormInput name={form.names.languages[i]} />
 *       <FormRemove name={form.names.languages} index={i} />
 *     </div>
 *   ))}
 * </Form>
 * ```
 */
export const FormRemove = forwardRef(function FormRemove(
  props: FormRemoveProps,
) {
  const htmlProps = useFormRemove(props);
  return createElement(TagName, htmlProps);
});

export interface FormRemoveOptions<T extends ElementType = TagName>
  extends ButtonOptions<T> {
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
   * Index of the item to remove.
   */
  index: number;
  /**
   * Whether the focus should be moved to the next or previous field when the
   * button is clicked.
   * @default true
   */
  autoFocusOnClick?: boolean;
}

export type FormRemoveProps<T extends ElementType = TagName> = Props<
  T,
  FormRemoveOptions<T>
>;
