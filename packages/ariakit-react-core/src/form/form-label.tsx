import type { MouseEvent } from "react";
import { useCallback, useRef } from "react";
import type { StringLike } from "@ariakit/core/form/types";
import { getFirstTabbableIn } from "@ariakit/core/utils/focus";
import { invariant } from "@ariakit/core/utils/misc";
import type { CollectionItemOptions } from "../collection/collection-item.js";
import { useCollectionItem } from "../collection/collection-item.js";
import { useEvent, useId, useMergeRefs, useTagName } from "../utils/hooks.js";
import {
  createElement,
  createHook,
  createMemoComponent,
} from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import { useFormContext } from "./form-context.js";
import type { FormStore } from "./form-store.js";

function supportsNativeLabel(tagName?: string) {
  return (
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select" ||
    tagName === "meter" ||
    tagName === "progress"
  );
}

/**
 * Returns props to create a `FormLabel` component. If the field is not a native
 * input, select or textarea element, the hook will return props to render a
 * `span` element. Instead of relying on the `htmlFor` prop, it'll rely on the
 * `aria-labelledby` attribute on the form field. Clicking on the label will
 * move focus to the field even if it's not a native input.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx
 * const store = useFormStore({ defaultValues: { email: "" } });
 * const props = useFormLabel({ store, name: store.names.email });
 * <Form store={store}>
 *   <Role {...props}>Email</Role>
 *   <FormInput name={store.names.email} />
 * </Form>
 * ```
 */
export const useFormLabel = createHook2<TagName, FormLabelOptions>(
  ({ store, name: nameProp, getItem: getItemProp, ...props }) => {
    const context = useFormContext();
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "FormLabel must be wrapped in a Form component.",
    );

    const id = useId(props.id);
    const ref = useRef<HTMLInputElement>(null);
    const name = `${nameProp}`;

    const getItem = useCallback<NonNullable<CollectionItemOptions["getItem"]>>(
      (item) => {
        const nextItem = { ...item, id: id || item.id, name, type: "label" };
        if (getItemProp) {
          return getItemProp(nextItem);
        }
        return nextItem;
      },
      [id, name, getItemProp],
    );

    const field = store.useState((state) =>
      state.items.find((item) => item.type === "field" && item.name === name),
    );
    const fieldTagName = useTagName(field?.element, "input");
    const isNativeLabel = supportsNativeLabel(fieldTagName);

    const onClickProp = props.onClick;

    const onClick = useEvent((event: MouseEvent<HTMLLabelElement>) => {
      onClickProp?.(event);
      if (event.defaultPrevented) return;
      if (isNativeLabel) return;
      const fieldElement = field?.element;
      if (!fieldElement) return;
      queueMicrotask(() => {
        const focusableElement = getFirstTabbableIn(fieldElement, true, true);
        focusableElement?.focus();
        focusableElement?.click();
      });
    });

    props = {
      id,
      render: isNativeLabel ? <label /> : <span />,
      htmlFor: isNativeLabel ? field?.id : undefined,
      ...props,
      ref: useMergeRefs(ref, props.ref),
      onClick,
    };

    if (!isNativeLabel) {
      props = {
        ...props,
        style: {
          cursor: "default",
          ...props.style,
        },
      };
    }

    props = useCollectionItem({ store, ...props, getItem });

    return props;
  },
);

/**
 * Renders a label associated with a form field, even if the field is not a
 * native input.
 *
 * If the field is a native input, select or textarea element, this component
 * will render a native `label` element and rely on its `htmlFor` prop.
 * Otherwise, it'll render a `span` element and rely on the `aria-labelledby`
 * attribute on the form field instead. Clicking on the label will move focus to
 * the field even if it's not a native input.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx {8}
 * const form = useFormStore({
 *   defaultValues: {
 *     email: "",
 *   },
 * });
 *
 * <Form store={form}>
 *   <FormLabel name={form.names.email}>Email</Role>
 *   <FormInput name={form.names.email} />
 * </Form>
 * ```
 */
export const FormLabel = createMemoComponent<FormLabelOptions>((props) => {
  const htmlProps = useFormLabel(props);
  return createElement("label", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  FormLabel.displayName = "FormLabel";
}

export interface FormLabelOptions<T extends As = "label">
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
   * Name of the field labeled by this element. This can either be a string or a
   * reference to a field name from the
   * [`names`](https://ariakit.org/reference/use-form-store#names) object in the
   * store, for type safety.
   * @example
   * ```jsx
   * <FormLabel name="email">Email</FormLabel>
   * ```
   */
  name: StringLike;
}

export type FormLabelProps<T extends As = "label"> = Props<FormLabelOptions<T>>;
