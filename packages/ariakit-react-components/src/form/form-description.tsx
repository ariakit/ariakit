import type { StringLike } from "@ariakit/components/form/types";
import {
  useMergeRefs,
  createElement,
  createHook,
  forwardRef,
  memo,
} from "@ariakit/react-utils";
import type { Props } from "@ariakit/react-utils";
import type { ElementType } from "react";
import type { CollectionItemOptions } from "../collection/collection-item.tsx";
import { useCollectionItem } from "../collection/collection-item.tsx";
import { useFormItem } from "./form-context.tsx";
import type { FormStore } from "./form-store.ts";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

/**
 * Returns props to create a `FormDescription` component.
 * @see https://ariakit.com/components/form
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
    const {
      store: form,
      id,
      ref,
      getItem,
    } = useFormItem<HTMLType>({
      store,
      name: nameProp,
      id: props.id,
      type: "description",
      getItem: getItemProp,
      component: "FormDescription",
    });

    props = {
      ...props,
      id,
      ref: useMergeRefs(ref, props.ref),
    };

    props = useCollectionItem({ store: form, ...props, getItem });

    return props;
  },
);

/**
 * Renders a description element for a form field, which will automatically
 * receive an `aria-describedby` attribute pointing to this element.
 * @see https://ariakit.com/components/form
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

export interface FormDescriptionOptions<
  T extends ElementType = TagName,
> extends CollectionItemOptions<T> {
  /**
   * Object returned by the
   * [`useFormStore`](https://ariakit.com/reference/use-form-store) hook. If not
   * provided, the closest [`Form`](https://ariakit.com/reference/form) or
   * [`FormProvider`](https://ariakit.com/reference/form-provider) components'
   * context will be used.
   */
  store?: FormStore;
  /**
   * Name of the field described by this element. This can either be a string or
   * a reference to a field name from the
   * [`names`](https://ariakit.com/reference/use-form-store#names) object in the
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
