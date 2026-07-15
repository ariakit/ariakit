import type { StringLike } from "@ariakit/components/form/types";
import { useStoreStateObject } from "@ariakit/react-store";
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
import { useMemo } from "react";
import type { CollectionItemOptions } from "../collection/collection-item.tsx";
import { useCollectionItem } from "../collection/collection-item.tsx";
import { useFormItem } from "./form-context.tsx";
import { useFormValidate } from "./form-store.ts";
import type { FormStore, FormStoreState } from "./form-store.ts";

const TagName = "input" satisfies ElementType;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

interface ControlItemIds {
  labelId?: string;
  errorId?: string;
  descriptionId?: string;
}

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

function getControlItemIds(items: FormStoreState["items"], name: string) {
  const ids: ControlItemIds = {};

  for (const item of items) {
    if (item.name !== name) continue;

    if (item.type === "label" && ids.labelId === undefined) {
      ids.labelId = item.id;
    } else if (item.type === "error" && ids.errorId === undefined) {
      ids.errorId = item.id;
    } else if (item.type === "description" && ids.descriptionId === undefined) {
      ids.descriptionId = item.id;
    }

    if (
      ids.labelId !== undefined &&
      ids.errorId !== undefined &&
      ids.descriptionId !== undefined
    ) {
      break;
    }
  }

  return ids;
}

function useControlState(form: FormStore, name: string) {
  const getItemIds = useMemo(() => {
    let prevItems: FormStoreState["items"] | undefined;
    let prevIds: ControlItemIds = {};

    return (state: Pick<FormStoreState, "items">) => {
      if (state.items !== prevItems) {
        prevItems = state.items;
        prevIds = getControlItemIds(state.items, name);
      }
      return prevIds;
    };
  }, [name]);

  return useStoreStateObject(form, ["items", "errors", "touched"], {
    labelId: (state) => getItemIds(state).labelId,
    errorId: (state) => getItemIds(state).errorId,
    descriptionId: (state) => getItemIds(state).descriptionId,
    invalid: () => !!form.getError(name) && form.getFieldTouched(name),
  });
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
 * const value = useFormValue(store, store.names.content);
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

    useFormValidate(form, async () => {
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

    const { labelId, errorId, descriptionId, invalid } = useControlState(
      form,
      name,
    );
    const describedBy = cx(errorId, descriptionId, props["aria-describedby"]);

    props = {
      "aria-labelledby": props["aria-label"] != null ? undefined : labelId,
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
 * const value = useFormValue(form, form.names.content);
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
