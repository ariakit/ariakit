import type { StringLike } from "@ariakit/core/form/types";
import { invariant } from "@ariakit/core/utils/misc";
import type { ElementType } from "react";
import { useCallback, useRef } from "react";
import type { CollectionItemOptions } from "../collection/collection-item.tsx";
import { useCollectionItem } from "../collection/collection-item.tsx";
import { useId, useMergeRefs } from "../utils/hooks.ts";
import { useStoreState } from "../utils/store.tsx";
import type { StoreProp } from "../utils/system.tsx";
import {
  createElement,
  createHook,
  forwardRef,
  memo,
} from "../utils/system.tsx";
import type { Props } from "../utils/types.ts";
import { useFormContextStore } from "./form-context.tsx";
import type { FormStore } from "./form-store.ts";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

/**
 * Returns props to create a `FormDescription` component.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx
 * const store = useFormStore({ defaultValues: { email: "" } });
 * const props = useFormError({ store, name: store.names.email });
 *
 * store.useValidate(() => {
 *   if (!store.getValue(store.names.email)) {
 *     store.setError(store.names.email, "Email is required!");
 *   }
 * });
 *
 * <Form store={store}>
 *   <FormLabel name={store.names.email}>Email</FormLabel>
 *   <FormInput name={store.names.email} />
 *   <Role {...props} />
 * </Form>
 * ```
 */
export const useFormError = createHook<TagName, FormErrorOptions>(
  function useFormError({
    store,
    name: nameProp,
    getItem: getItemProp,
    ...props
  }) {
    store = useFormContextStore(store, "FormError");

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "FormError must be wrapped in a Form component.",
    );

    const id = useId(props.id);
    const ref = useRef<HTMLType>(null);
    const name = String(nameProp);

    const getItem = useCallback<NonNullable<CollectionItemOptions["getItem"]>>(
      (item) => {
        const nextItem = { ...item, id: id || item.id, name, type: "error" };
        if (getItemProp) {
          return getItemProp(nextItem);
        }
        return nextItem;
      },
      [id, name, getItemProp],
    );

    const children = useStoreState(store, () => {
      const error = store?.getError(name);
      if (error == null) return;
      if (!store?.getFieldTouched(name)) return;
      return error;
    });

    props = {
      role: "alert",
      children,
      ...props,
      id,
      ref: useMergeRefs(ref, props.ref),
    };

    props = useCollectionItem({ store, ...props, getItem });

    return props;
  },
);

/**
 * Renders an element that shows an error message. The `children` will
 * automatically display the error message defined in the store.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx {16}
 * const form = useFormStore({
 *   defaultValues: {
 *     email: "",
 *   },
 * });
 *
 * form.useValidate(() => {
 *   if (!form.values.email) {
 *     form.setError(form.names.email, "Email is required!");
 *   }
 * });
 *
 * <Form store={form}>
 *   <FormLabel name={form.names.email}>Email</FormLabel>
 *   <FormInput name={form.names.email} />
 *   <FormError name={form.names.email} />
 * </Form>
 * ```
 */
export const FormError = memo(
  forwardRef(function FormError(props: FormErrorProps) {
    const htmlProps = useFormError(props);
    return createElement(TagName, htmlProps);
  }),
);

export interface FormErrorOptions<
  T extends ElementType = TagName,
> extends CollectionItemOptions<T> {
  /**
   * Object returned by the
   * [`useFormStore`](https://ariakit.org/reference/use-form-store) hook.
   * This prop can also receive the corresponding
   * [`FormProvider`](https://ariakit.org/reference/form-provider) component,
   * which makes the component read the store from that provider's context
   * explicitly, or `null`, which disables context lookup.
   * If not provided, the closest
   * [`FormProvider`](https://ariakit.org/reference/form-provider)
   * component's context will be used.
   */
  store?: StoreProp<FormStore>;
  /**
   * Name of the field associated with this error. This can either be a string
   * or a reference to a field name from the
   * [`names`](https://ariakit.org/reference/use-form-store#names) object in the
   * store, for type safety.
   * @example
   * ```jsx
   * <FormError name="password" />
   * ```
   */
  name: StringLike;
}

export type FormErrorProps<T extends ElementType = TagName> = Props<
  T,
  FormErrorOptions<T>
>;
