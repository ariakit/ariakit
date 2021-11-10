import { useCallback, useRef } from "react";
import { useForkRef, useId } from "ariakit-utils/hooks";
import { createMemoComponent, useStore } from "ariakit-utils/store";
import { createElement, createHook } from "ariakit-utils/system";
import { As, Props } from "ariakit-utils/types";
import {
  CollectionItemOptions,
  useCollectionItem,
} from "../collection/collection-item";
import { FormContext, StringLike } from "./__utils";
import { FormState } from "./form-state";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a description element for a form field.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx
 * const state = useFormState({ defaultValues: { password: "" } });
 * const props = useFormDescription({ state, name: state.names.password });
 * <Form state={state}>
 *   <FormLabel name={state.names.password}>Password</FormLabel>
 *   <FormInput name={state.names.password} type="password" />
 *   <Role {...props}>Password with at least 8 characters.</Role>
 * </Form>
 * ```
 */
export const useFormDescription = createHook<FormDescriptionOptions>(
  ({ state, name: nameProp, ...props }) => {
    state = useStore(state || FormContext, []);
    const ref = useRef<HTMLInputElement>(null);

    const id = useId(props.id);
    const name = `${nameProp}`;

    const getItem = useCallback(
      (item) => {
        const nextItem = { ...item, id, name, type: "description" };
        if (props.getItem) {
          return props.getItem(nextItem);
        }
        return nextItem;
      },
      [id, name, props.getItem]
    );

    props = {
      id,
      ...props,
      ref: useForkRef(ref, props.ref),
    };

    props = useCollectionItem({ state, ...props, getItem });

    return props;
  }
);

/**
 * A component that renders a description element for a form field.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx
 * const form = useFormState({ defaultValues: { password: "" } });
 * <Form state={form}>
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

export type FormDescriptionOptions<T extends As = "div"> = Omit<
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

export type FormDescriptionProps<T extends As = "div"> = Props<
  FormDescriptionOptions<T>
>;
