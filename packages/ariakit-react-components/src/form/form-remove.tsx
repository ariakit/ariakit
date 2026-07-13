import type { StringLike } from "@ariakit/components/form/types";
import {
  useEvent,
  createElement,
  createHook,
  forwardRef,
} from "@ariakit/react-utils";
import type { Props } from "@ariakit/react-utils";
import { isTextField } from "@ariakit/utils";
import type { ElementType, MouseEvent } from "react";
import type { ButtonOptions } from "../button/button.tsx";
import { useButton } from "../button/button.tsx";
import { withDefaultButtonType } from "../button/utils.ts";
import { useFormItemContext } from "./form-context.tsx";
import type { FormStore, FormStoreState } from "./form-store.ts";
import { getArrayFieldIndex, isArrayFieldName } from "./utils.ts";

const TagName = "button" satisfies ElementType;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

function findNextOrPreviousField(
  items: FormStoreState["items"] | undefined,
  name: string,
  index: number,
) {
  const fields = items?.filter(
    (item) => item.type === "field" && isArrayFieldName(item.name, name),
  );
  const nextField = fields?.find(
    (field) => getArrayFieldIndex(field.name, name) > index,
  );
  if (nextField) return nextField;
  return fields
    ?.reverse()
    .find((field) => getArrayFieldIndex(field.name, name) < index);
}

function findPushButton(
  items: FormStoreState["items"] | undefined,
  name: string,
) {
  return items?.find((item) => item.type === "button" && item.name === name);
}

/**
 * Returns props to create a `FormRemove` component.
 * @see https://ariakit.com/components/form
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
 * const values = useStoreState(store, "values");
 *
 * <Form store={store}>
 *   {values.languages.map((language, i) => {
 *     if (language == null) return null;
 *     return <FormInput key={i} name={store.names.languages[i]} />;
 *   })}
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
    const { store: form, name } = useFormItemContext({
      store,
      name: nameProp,
      component: "FormRemove",
    });
    const onClickProp = props.onClick;

    const onClick = useEvent((event: MouseEvent<HTMLType>) => {
      onClickProp?.(event);
      if (event.defaultPrevented) return;
      form.removeValue(name, index);
      if (!autoFocusOnClick) return;
      const { items } = form.getState();
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
 * The [`name`](https://ariakit.com/reference/form-remove#name) prop must be
 * provided to identify the array field. Similarly, the
 * [`index`](https://ariakit.com/reference/form-remove#index) prop is required
 * to pinpoint the item to remove.
 *
 * By default, the button will automatically move focus to the next field in the
 * form when clicked, or to the previous field if there isn't a next field. This
 * behavior can be disabled by setting the
 * [`autoFocusOnClick`](https://ariakit.com/reference/form-remove#autofocusonclick)
 * prop to `false`.
 * @see https://ariakit.com/components/form
 * @example
 * ```jsx {15}
 * const form = useFormStore({
 *   defaultValues: {
 *     languages: ["JavaScript", "PHP"],
 *   },
 * });
 *
 * const values = useStoreState(form, "values");
 *
 * <Form store={form}>
 *   {values.languages.map((language, i) => {
 *     if (language == null) return null;
 *     return (
 *       <div key={i}>
 *         <FormInput name={form.names.languages[i]} />
 *         <FormRemove name={form.names.languages} index={i} />
 *       </div>
 *     );
 *   })}
 * </Form>
 * ```
 */
export const FormRemove = forwardRef(function FormRemove(
  props: FormRemoveProps,
) {
  const htmlProps = useFormRemove(withDefaultButtonType(props));
  return createElement(TagName, htmlProps);
});

export interface FormRemoveOptions<
  T extends ElementType = TagName,
> extends ButtonOptions<T> {
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
