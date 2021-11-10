import { MouseEvent, useCallback, useRef } from "react";
import { getFirstTabbableIn } from "ariakit-utils/focus";
import {
  useEventCallback,
  useForkRef,
  useId,
  useTagName,
} from "ariakit-utils/hooks";
import { queueMicrotask } from "ariakit-utils/misc";
import { createMemoComponent, useStore } from "ariakit-utils/store";
import { createElement, createHook } from "ariakit-utils/system";
import { As, Props } from "ariakit-utils/types";
import {
  CollectionItemOptions,
  useCollectionItem,
} from "../collection/collection-item";
import { FormContext, StringLike } from "./__utils";
import { FormState } from "./form-state";

function findField(items: FormState["items"] | undefined, name: string) {
  return items?.find((item) => item.type === "field" && item.name === name);
}

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
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a label for a form field. If the field is not a
 * native input, select or textarea element, the hook will return props to
 * render a `span` element. Instead of relying on the `htmlFor` prop, it'll rely
 * on the `aria-labelledby` attribute on the form field. Clicking on the label
 * will move focus to the field even if it's not a native input.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx
 * const state = useFormState({ defaultValues: { email: "" } });
 * const props = useFormLabel({ state, name: state.names.email });
 * <Form state={state}>
 *   <Role {...props}>Email</Role>
 *   <FormInput name={state.names.email} />
 * </Form>
 * ```
 */
export const useFormLabel = createHook<FormLabelOptions>(
  ({ state, name: nameProp, ...props }) => {
    const name = `${nameProp}`;
    state = useStore(state || FormContext, [
      useCallback((s: FormState) => findField(s.items, name), [name]),
    ]);

    const ref = useRef<HTMLInputElement>(null);
    const id = useId(props.id);

    const getItem = useCallback(
      (item) => {
        const nextItem = { ...item, id, name, type: "label" };
        if (props.getItem) {
          return props.getItem(nextItem);
        }
        return nextItem;
      },
      [id, name, props.getItem]
    );

    const field = findField(state?.items, name);
    const fieldTagName = useTagName(field?.ref, "input");
    const isNativeLabel = supportsNativeLabel(fieldTagName);

    const onClickProp = useEventCallback(props.onClick);

    const onClick = useCallback(
      (event: MouseEvent<HTMLLabelElement>) => {
        onClickProp(event);
        if (event.defaultPrevented) return;
        if (isNativeLabel) return;
        const fieldElement = field?.ref.current;
        if (!fieldElement) return;
        queueMicrotask(() => {
          const focusableElement = getFirstTabbableIn(fieldElement, true, true);
          focusableElement?.focus();
        });
      },
      [onClickProp, isNativeLabel, field]
    );

    props = {
      id,
      // @ts-expect-error
      as: isNativeLabel ? "label" : "span",
      htmlFor: isNativeLabel ? field?.id : undefined,
      ...props,
      ref: useForkRef(ref, props.ref),
      onClick,
    };

    props = useCollectionItem({ state, ...props, getItem });

    return props;
  }
);

/**
 * A component that renders a label for a form field. If the field is not a
 * native input, select or textarea element, the component will render a `span`
 * element. Instead of relying on the `htmlFor` prop, it'll rely on the
 * `aria-labelledby` attribute on the form field. Clicking on the label will
 * move focus to the field even if it's not a native input.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx
 * const form = useFormState({ defaultValues: { email: "" } });
 * <Form state={form}>
 *   <FormLabel name={form.names.email}>Email</Role>
 *   <FormInput name={form.names.email} />
 * </Form>
 * ```
 */
export const FormLabel = createMemoComponent<FormLabelOptions>((props) => {
  const htmlProps = useFormLabel(props);
  return createElement("label", htmlProps);
});

export type FormLabelOptions<T extends As = "label"> = Omit<
  CollectionItemOptions<T>,
  "state"
> & {
  /**
   * Object returned by the `useFormState` hook. If not provided, the parent
   * `Form` component's context will be used.
   */
  state?: FormState;
  /**
   * Name of the field.
   */
  name: StringLike;
};

export type FormLabelProps<T extends As = "label"> = Props<FormLabelOptions<T>>;
