import { MouseEvent, useCallback, useContext, useRef } from "react";
import { StringLike } from "@ariakit/core/form/types";
import { getFirstTabbableIn } from "@ariakit/core/utils/focus";
import { invariant } from "@ariakit/core/utils/misc";
import {
  CollectionItemOptions,
  useCollectionItem,
} from "../collection/collection-item.js";
import { useEvent, useForkRef, useId, useTagName } from "../utils/hooks.js";
import {
  createElement,
  createHook,
  createMemoComponent,
} from "../utils/system.js";
import { As, Props } from "../utils/types.js";
import { FormContext } from "./form-context.js";
import { FormStore } from "./form-store.js";

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
export const useFormLabel = createHook<FormLabelOptions>(
  ({ store, name: nameProp, getItem: getItemProp, ...props }) => {
    const context = useContext(FormContext);
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "FormLabel must be wrapped in a Form component"
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
      [id, name, getItemProp]
    );

    const field = store.useState((state) =>
      state.items.find((item) => item.type === "field" && item.name === name)
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
      // @ts-expect-error
      as: isNativeLabel ? "label" : "span",
      htmlFor: isNativeLabel ? field?.id : undefined,
      ...props,
      ref: useForkRef(ref, props.ref),
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
  }
);

/**
 * Renders a label for a form field. If the field is not a native input, select
 * or textarea element, the component will render a `span` element. Instead of
 * relying on the `htmlFor` prop, it'll rely on the `aria-labelledby` attribute
 * on the form field. Clicking on the label will move focus to the field even if
 * it's not a native input.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx
 * const form = useFormStore({ defaultValues: { email: "" } });
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
   * Object returned by the `useFormStore` hook. If not provided, the parent
   * `Form` component's context will be used.
   */
  store?: FormStore;
  /**
   * Name of the field.
   */
  name: StringLike;
}

export type FormLabelProps<T extends As = "label"> = Props<FormLabelOptions<T>>;
