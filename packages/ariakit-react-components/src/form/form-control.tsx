import type { StringLike } from "@ariakit/components/form/types";
import { useStoreState } from "@ariakit/react-store";
import {
  useBooleanEvent,
  useEvent,
  useMergeRefs,
  createElement,
  createHook,
  forwardRef,
  memo,
} from "@ariakit/react-utils";
import type { Props } from "@ariakit/react-utils";
import { getDocument, cx } from "@ariakit/utils";
import type { BooleanOrCallback } from "@ariakit/utils";
import type { ElementType, FocusEvent, RefObject } from "react";
import type { CollectionItemOptions } from "../collection/collection-item.tsx";
import { useCollectionItem } from "../collection/collection-item.tsx";
import { useFormItem } from "./form-context.tsx";
import type { FormStore } from "./form-store.ts";

const TagName = "input" satisfies ElementType;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];
type ItemType = "label" | "error" | "description";

function getNamedElement(
  ref: RefObject<HTMLInputElement | null>,
  name: string,
) {
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
  return useStoreState(store, (state) =>
    state.items.find((item) => item.type === type && item.name === name),
  );
}

/**
 * Returns props to create a `FormControl` component. Unlike `useFormInput`,
 * this hook doesn't automatically returns the `value` and `onChange` props.
 * This is so we can use it not only for native form elements but also for
 * custom components whose value is not controlled by the native `value` and
 * `onChange` props.
 * @see https://ariakit.com/components/form
 * @example
 * ```jsx
 * const store = useFormStore({ defaultValues: { content: "" } });
 * const props = useFormControl({ store, name: store.names.content });
 * const value = store.useValue(store.names.content);
 *
 * <Form store={store}>
 *   <FormLabel name={store.names.content}>Content</FormLabel>
 *   <Role
 *     {...props}
 *     value={value}
 *     onChange={(value) => store.setValue(store.names.content, value)}
 *     render={<Editor />}
 *   />
 * </Form>
 * ```
 */
export const useFormControl = createHook<TagName, FormControlOptions>(
  function useFormControl({
    store,
    name: nameProp,
    getItem: getItemProp,
    touchOnBlur = true,
    ...props
  }) {
    const {
      store: form,
      name,
      id,
      ref,
      getItem,
    } = useFormItem<HTMLType>({
      store,
      name: nameProp,
      id: props.id,
      type: "field",
      getItem: getItemProp,
      component: "FormControl",
    });

    form.useValidate(async () => {
      const element = getNamedElement(ref, name);
      if (!element) return;
      // Flush microtasks to make sure the validity state is up to date
      await Promise.resolve();
      if ("validity" in element && !element.validity.valid) {
        form.setError(name, element.validationMessage);
      }
    });

    const onBlurProp = props.onBlur;
    const touchOnBlurProp = useBooleanEvent(touchOnBlur);

    const onBlur = useEvent((event: FocusEvent<HTMLType>) => {
      onBlurProp?.(event);
      if (event.defaultPrevented) return;
      if (!touchOnBlurProp(event)) return;
      form.setFieldTouched(name, true);
    });

    const label = useItem(form, name, "label");
    const error = useItem(form, name, "error");
    const description = useItem(form, name, "description");
    const describedBy = cx(
      error?.id,
      description?.id,
      props["aria-describedby"],
    );

    const invalid = useStoreState(
      form,
      () => !!form.getError(name) && form.getFieldTouched(name),
    );

    props = {
      "aria-labelledby": props["aria-label"] != null ? undefined : label?.id,
      "aria-invalid": invalid,
      ...props,
      id,
      "aria-describedby": describedBy || undefined,
      ref: useMergeRefs(ref, props.ref),
      onBlur,
    };

    props = useCollectionItem<TagName>({
      store: form,
      ...props,
      name,
      getItem,
    });

    return props;
  },
);

/**
 * Abstract component that renders a form control. Unlike
 * [`FormInput`](https://ariakit.com/reference/form-input), this component
 * doesn't automatically pass the `value` and `onChange` props down to the
 * underlying element. This is so we can use it not only for native form
 * elements but also for custom components whose value is not controlled by the
 * native `value` and `onChange` props.
 * @see https://ariakit.com/components/form
 * @example
 * ```jsx {11-19}
 * const form = useFormStore({
 *   defaultValues: {
 *     content: "",
 *   },
 * });
 *
 * const value = form.useValue(form.names.content);
 *
 * <Form store={form}>
 *   <FormLabel name={form.names.content}>Content</FormLabel>
 *   <FormControl
 *     name={form.names.content}
 *     render={
 *       <Editor
 *         value={value}
 *         onChange={(value) => form.setValue(form.names.content, value)}
 *       />
 *     }
 *   />
 * </Form>
 * ```
 */
export const FormControl = memo(
  forwardRef(function FormControl(props: FormControlProps) {
    const htmlProps = useFormControl(props);
    return createElement(TagName, htmlProps);
  }),
);

export interface FormControlOptions<
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
   * Field name. This can either be a string corresponding to an existing
   * property name in the
   * [`values`](https://ariakit.com/reference/use-form-store#values) state of
   * the store, or a reference to a field name from the
   * [`names`](https://ariakit.com/reference/use-form-store#names) object in the
   * store, ensuring type safety.
   *
   * Live examples:
   * - [FormRadio](https://ariakit.com/examples/form-radio)
   * - [Form with Select](https://ariakit.com/examples/form-select)
   */
  name: StringLike;
  /**
   * Whether the field should be marked touched on blur.
   * @default true
   */
  touchOnBlur?: BooleanOrCallback<FocusEvent>;
}

export type FormControlProps<T extends ElementType = TagName> = Props<
  T,
  FormControlOptions<T>
>;
