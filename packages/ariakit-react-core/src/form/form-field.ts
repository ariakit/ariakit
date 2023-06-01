import type { FocusEvent, RefObject } from "react";
import { useCallback, useContext, useRef } from "react";
import type { StringLike } from "@ariakit/core/form/types";
import { getDocument } from "@ariakit/core/utils/dom";
import { cx, invariant } from "@ariakit/core/utils/misc";
import type { BooleanOrCallback } from "@ariakit/core/utils/types";
import type { CollectionItemOptions } from "../collection/collection-item.js";
import { useCollectionItem } from "../collection/collection-item.js";
import {
  useBooleanEvent,
  useEvent,
  useId,
  useMergeRefs,
} from "../utils/hooks.js";
import {
  createElement,
  createHook,
  createMemoComponent,
} from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import { FormContext } from "./form-context.js";
import type { FormStore } from "./form-store.js";

type ItemType = "label" | "error" | "description";

function getNamedElement(ref: RefObject<HTMLInputElement>, name: string) {
  const element = ref.current;
  if (!element) return null;
  if (element.name === name) return element;
  if (element.form) {
    return element.form.elements.namedItem(name) as HTMLInputElement | null;
  }
  const document = getDocument(element);
  return document.getElementsByName(name)[0] as HTMLInputElement | null;
}

function useItem(store: FormStore, name: string, type: ItemType) {
  return store.useState((state) =>
    state.items.find((item) => item.type === type && item.name === name)
  );
}

/**
 * Returns props to create a `FormField` component. Unlike `useFormInput`, this
 * hook doesn't automatically returns the `value` and `onChange` props. This is
 * so we can use it not only for native form elements but also for custom
 * components whose value is not controlled by the native `value` and `onChange`
 * props.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx
 * const store = useFormStore({ defaultValues: { content: "" } });
 * const props = useFormField({ store, name: store.names.content });
 * const value = store.useValue(store.names.content);
 *
 * <Form store={store}>
 *   <FormLabel name={store.names.content}>Content</FormLabel>
 *   <Role
 *     {...props}
 *     as={Editor}
 *     value={value}
 *     onChange={(value) => store.setValue(store.names.content, value)}
 *   />
 * </Form>
 * ```
 */
export const useFormField = createHook<FormFieldOptions>(
  ({
    store,
    name: nameProp,
    getItem: getItemProp,
    touchOnBlur = true,
    ...props
  }) => {
    const context = useContext(FormContext);
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "FormField must be wrapped in a Form component"
    );

    const name = `${nameProp}`;
    const id = useId(props.id);
    const ref = useRef<HTMLInputElement>(null);

    store.useValidate(async () => {
      const element = getNamedElement(ref, name);
      if (!element) return;
      // Flush microtasks to make sure the validity state is up to date
      await Promise.resolve();
      if ("validity" in element && !element.validity.valid) {
        store?.setError(name, element.validationMessage);
      }
    });

    const getItem = useCallback<NonNullable<CollectionItemOptions["getItem"]>>(
      (item) => {
        const nextItem = { ...item, id: id || item.id, name, type: "field" };
        if (getItemProp) {
          return getItemProp(nextItem);
        }
        return nextItem;
      },
      [id, name, getItemProp]
    );

    const onBlurProp = props.onBlur;
    const touchOnBlurProp = useBooleanEvent(touchOnBlur);

    const onBlur = useEvent((event: FocusEvent<HTMLInputElement>) => {
      onBlurProp?.(event);
      if (event.defaultPrevented) return;
      if (!touchOnBlurProp(event)) return;
      store?.setFieldTouched(name, true);
    });

    const label = useItem(store, name, "label");
    const error = useItem(store, name, "error");
    const description = useItem(store, name, "description");
    const describedBy = cx(
      error?.id,
      description?.id,
      props["aria-describedby"]
    );

    const invalid = store.useState(
      () => !!store?.getError(name) && store.getFieldTouched(name)
    );

    props = {
      id,
      "aria-labelledby": label?.id,
      "aria-invalid": invalid,
      ...props,
      "aria-describedby": describedBy || undefined,
      ref: useMergeRefs(ref, props.ref),
      onBlur,
    };

    props = useCollectionItem({ store, ...props, name, getItem });

    return props;
  }
);

/**
 * Renders a form field. Unlike `FormInput`, this component doesn't
 * automatically pass the `value` and `onChange` props down to the underlying
 * element. This is so we can use it not only for native form elements but also
 * for custom components whose value is not controlled by the native `value` and
 * `onChange` props.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx
 * const form = useFormStore({ defaultValues: { content: "" } });
 * const value = form.useValue(form.names.content);
 *
 * <Form store={form}>
 *   <FormLabel name={form.names.content}>Content</FormLabel>
 *   <FormField
 *     {...props}
 *     as={Editor}
 *     value={value}
 *     onChange={(value) => form.setValue(form.names.content, value)}
 *   />
 * </Form>
 * ```
 */
export const FormField = createMemoComponent<FormFieldOptions>((props) => {
  const htmlProps = useFormField(props);
  return createElement("input", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  FormField.displayName = "FormField";
}

export interface FormFieldOptions<T extends As = "input">
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
  /**
   * Whether the field should be marked touched on blur.
   * @default true
   */
  touchOnBlur?: BooleanOrCallback<FocusEvent>;
}

export type FormFieldProps<T extends As = "input"> = Props<FormFieldOptions<T>>;
