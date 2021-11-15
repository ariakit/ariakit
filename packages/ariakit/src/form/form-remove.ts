import { MouseEvent, useCallback } from "react";
import { isTextField } from "ariakit-utils/dom";
import { useEventCallback } from "ariakit-utils/hooks";
import { useStore } from "ariakit-utils/store";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { As, Props } from "ariakit-utils/types";
import { ButtonOptions, useButton } from "../button";
import { FormContext, StringLike } from "./__utils";
import { FormState } from "./form-state";

function findNextOrPreviousField(
  items: FormState["items"] | undefined,
  name: string,
  index: number
) {
  const fields = items?.filter(
    (item) => item.type === "field" && item.name.startsWith(name)
  );
  const regex = new RegExp(`^${name}\\.(\\d+)`);
  const nextField = fields?.find((field) => {
    const fieldIndex = field.name.replace(regex, "$1");
    return Number(fieldIndex) > index;
  });
  if (nextField) return nextField;
  return fields?.reverse().find((field) => {
    const fieldIndex = field.name.replace(regex, "$1");
    return Number(fieldIndex) < index;
  });
}

function findPushButton(items: FormState["items"] | undefined, name: string) {
  return items?.find((item) => item.type === "button" && item.name === name);
}

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a button that will remove an item from an array
 * field in the form when clicked.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx
 * const state = useFormState({
 *   defaultValues: {
 *     languages: ["JavaScript", "PHP"],
 *   },
 * });
 * const props = useFormRemove({
 *   state,
 *   name: state.names.languages,
 *   index: 0,
 * });
 * <Form state={state}>
 *   {state.values.languages.map((_, i) => (
 *     <FormInput key={i} name={state.names.languages[i]} />
 *   ))}
 *   <Role {...props}>Remove first language</Role>
 * </Form>
 * ```
 */
export const useFormRemove = createHook<FormRemoveOptions>(
  ({ state, name: nameProp, index, autoFocusOnClick = true, ...props }) => {
    const name = `${nameProp}`;
    state = useStore(state || FormContext, ["items", "removeValue"]);

    const onClickProp = useEventCallback(props.onClick);

    const onClick = useCallback(
      (event: MouseEvent<HTMLButtonElement>) => {
        onClickProp(event);
        if (event.defaultPrevented) return;
        state?.removeValue(name, index);
        if (!autoFocusOnClick) return;
        const item = findNextOrPreviousField(state?.items, name, index);
        const element = item?.ref.current;
        if (element) {
          element.focus();
          if (isTextField(element)) {
            element.select();
          }
        } else {
          const pushButton = findPushButton(state?.items, name);
          pushButton?.ref.current?.focus();
        }
      },
      [
        onClickProp,
        state?.removeValue,
        name,
        index,
        autoFocusOnClick,
        state?.items,
      ]
    );

    props = {
      ...props,
      onClick,
    };

    props = useButton(props);

    return props;
  }
);

/**
 * A component that renders a button that will remove an item from an array
 * field in the form when clicked.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx
 * const form = useFormState({
 *   defaultValues: {
 *     languages: ["JavaScript", "PHP"],
 *   },
 * });
 * <Form state={form}>
 *   {form.values.languages.map((_, i) => (
 *     <div key={i}>
 *       <FormInput name={form.names.languages[i]} />
 *       <FormRemove name={form.names.languages} index={i} />
 *     </div>
 *   ))}
 * </Form>
 * ```
 */
export const FormRemove = createComponent<FormRemoveOptions>((props) => {
  const htmlProps = useFormRemove(props);
  return createElement("button", htmlProps);
});

export type FormRemoveOptions<T extends As = "button"> = ButtonOptions<T> & {
  /**
   * Object returned by the `useFormState` hook. If not provided, the parent
   * `Form` component's context will be used.
   */
  state?: FormState;
  /**
   * Name of the array field.
   */
  name: StringLike;
  /**
   * Index of the item to remove.
   */
  index: number;
  /**
   * Whether the focus should be moved to the next or previous field when the
   * button is clicked.
   * @default true
   */
  autoFocusOnClick?: boolean;
};

export type FormRemoveProps<T extends As = "button"> = Props<
  FormRemoveOptions<T>
>;
