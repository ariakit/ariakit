import { useCallback, useRef } from "react";
import type { ElementType } from "react";
import type { StringLike } from "@ariakit/core/form/types";
import { invariant } from "@ariakit/core/utils/misc";
import type { CollectionItemOptions } from "../collection/collection-item.ts";
import { useCollectionItem } from "../collection/collection-item.ts";
import { useId, useMergeRefs } from "../utils/hooks.ts";
import {
  createElement,
  createHook,
  forwardRef,
  memo,
} from "../utils/system.tsx";
import type { Props } from "../utils/types.ts";
import { useFormContext } from "./form-context.tsx";
import type { FormStore } from "./form-store.ts";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

/**
 * Returns props to create a `FormDescription` component.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx
 * const store = useFormStore({ defaultValues: { password: "" } });
 * const props = useFormDescription({ store, name: store.names.password });
 * <Form store={store}>
 *   <FormLabel name={store.names.password}>Password</FormLabel>
 *   <FormInput name={store.names.password} type="password" />
 *   <Role {...props}>Password with at least 8 characters.</Role>
 * </Form>
 * ```
 */
export const useFormDescription = createHook<TagName, FormDescriptionOptions>(
  function useFormDescription({
    store,
    name: nameProp,
    getItem: getItemProp,
    ...props
  }) {
    const context = useFormContext();
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "FormDescription must be wrapped in a Form component.",
    );

    const id = useId(props.id);
    const ref = useRef<HTMLType>(null);
    const name = `${nameProp}`;

    const getItem = useCallback<NonNullable<CollectionItemOptions["getItem"]>>(
      (item) => {
        const nextItem = {
          ...item,
          id: id || item.id,
          name,
          type: "description",
        };
        if (getItemProp) {
          return getItemProp(nextItem);
        }
        return nextItem;
      },
      [id, name, getItemProp],
    );

    props = {
      id,
      ...props,
      ref: useMergeRefs(ref, props.ref),
    };

    props = useCollectionItem({ store, ...props, getItem });

    return props;
  },
);

/**
 * Renders a description element for a form field, which will automatically
 * receive an `aria-describedby` attribute pointing to this element.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx {10-12}
 * const form = useFormStore({
 *   defaultValues: {
 *     password: "",
 *   },
 * });
 *
 * <Form store={form}>
 *   <FormLabel name={form.names.password}>Password</FormLabel>
 *   <FormInput name={form.names.password} type="password" />
 *   <FormDescription name={form.names.password}>
 *     Password with at least 8 characters.
 *   </FormDescription>
 * </Form>
 * ```
 */
export const FormDescription = memo(
  forwardRef(function FormDescription(props: FormDescriptionProps) {
    const htmlProps = useFormDescription(props);
    return createElement(TagName, htmlProps);
  }),
);

export interface FormDescriptionOptions<T extends ElementType = TagName>
  extends CollectionItemOptions<T> {
  /**
   * Object returned by the
   * [`useFormStore`](https://ariakit.org/reference/use-form-store) hook. If not
   * provided, the closest [`Form`](https://ariakit.org/reference/form) or
   * [`FormProvider`](https://ariakit.org/reference/form-provider) components'
   * context will be used.
   */
  store?: FormStore;
  /**
   * Name of the field described by this element. This can either be a string or
   * a reference to a field name from the
   * [`names`](https://ariakit.org/reference/use-form-store#names) object in the
   * store, for type safety.
   * @example
   * ```jsx
   * <FormDescription name="password">
   *   Password with at least 8 characters.
   * </FormDescription>
   * ```
   */
  name: StringLike;
}

export type FormDescriptionProps<T extends ElementType = TagName> = Props<
  T,
  FormDescriptionOptions<T>
>;
