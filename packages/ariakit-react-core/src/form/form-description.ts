import { useCallback, useContext, useRef } from "react";
import type { StringLike } from "@ariakit/core/form/types";
import { invariant } from "@ariakit/core/utils/misc";
import type { CollectionItemOptions } from "../collection/collection-item.js";
import { useCollectionItem } from "../collection/collection-item.js";
import { useForkRef, useId } from "../utils/hooks.js";
import {
  createElement,
  createHook,
  createMemoComponent,
} from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import { FormContext } from "./form-context.js";
import type { FormStore } from "./form-store.js";

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
export const useFormDescription = createHook<FormDescriptionOptions>(
  ({ store, name: nameProp, getItem: getItemProp, ...props }) => {
    const context = useContext(FormContext);
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "FormDescription must be wrapped in a Form component"
    );

    const id = useId(props.id);
    const ref = useRef<HTMLInputElement>(null);
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
      [id, name, getItemProp]
    );

    props = {
      id,
      ...props,
      ref: useForkRef(ref, props.ref),
    };

    props = useCollectionItem({ store, ...props, getItem });

    return props;
  }
);

/**
 * Renders a description element for a form field.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx
 * const form = useFormStore({ defaultValues: { password: "" } });
 * <Form store={form}>
 *   <FormLabel name={form.names.password}>Password</FormLabel>
 *   <FormInput name={form.names.password} type="password" />
 *   <FormDescription name={form.names.password}>
 *     Password with at least 8 characters.
 *   </FormDescription>
 * </Form>
 * ```
 */
export const FormDescription = createMemoComponent<FormDescriptionOptions>(
  (props) => {
    const htmlProps = useFormDescription(props);
    return createElement("div", htmlProps);
  }
);

if (process.env.NODE_ENV !== "production") {
  FormDescription.displayName = "FormDescription";
}

export interface FormDescriptionOptions<T extends As = "div">
  extends CollectionItemOptions<T> {
  /**
   * Object returned by the `useFormStore` hook. If not provided, the parent
   * `Form` component's context will be used.
   */
  store?: FormStore;
  /**
   * Name of the field.
   */
  name: StringLike;
}

export type FormDescriptionProps<T extends As = "div"> = Props<
  FormDescriptionOptions<T>
>;
