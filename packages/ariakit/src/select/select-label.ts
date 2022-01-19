import { MouseEvent, useCallback } from "react";
import { useEventCallback, useForkRef, useId } from "ariakit-utils/hooks";
import { queueMicrotask } from "ariakit-utils/misc";
import { createMemoComponent } from "ariakit-utils/store";
import { createElement, createHook } from "ariakit-utils/system";
import { As, Options, Props } from "ariakit-utils/types";
import { SelectState } from "./select-state";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a label for a select field. If the field is not a
 * native input, select or textarea element, the hook will return props to
 * render a `span` element. Instead of relying on the `htmlFor` prop, it'll rely
 * on the `aria-labelledby` attribute on the select field. Clicking on the label
 * will move focus to the field even if it's not a native input.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx
 * const state = useSelectState({ defaultValues: { email: "" } });
 * const props = useSelectLabel({ state, name: state.names.email });
 * <Select state={state}>
 *   <Role {...props}>Email</Role>
 *   <SelectInput name={state.names.email} />
 * </Select>
 * ```
 */
export const useSelectLabel = createHook<SelectLabelOptions>(
  ({ state, ...props }) => {
    const id = useId(props.id);

    const onClickProp = useEventCallback(props.onClick);

    const onClick = useCallback(
      (event: MouseEvent<HTMLDivElement>) => {
        onClickProp(event);
        if (event.defaultPrevented) return;
        queueMicrotask(() => {
          const select = state.selectRef.current;
          select?.focus();
          select?.click();
        });
      },
      [onClickProp, state.selectRef]
    );

    props = {
      id,
      ...props,
      ref: useForkRef(state.labelRef, props.ref),
      onClick,
      style: {
        cursor: "default",
        ...props.style,
      },
    };

    return props;
  }
);

/**
 * A component that renders a label for a select field. If the field is not a
 * native input, select or textarea element, the component will render a `span`
 * element. Instead of relying on the `htmlFor` prop, it'll rely on the
 * `aria-labelledby` attribute on the select field. Clicking on the label will
 * move focus to the field even if it's not a native input.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx
 * const select = useSelectState({ defaultValues: { email: "" } });
 * <Select state={select}>
 *   <SelectLabel name={select.names.email}>Email</Role>
 *   <SelectInput name={select.names.email} />
 * </Select>
 * ```
 */
export const SelectLabel = createMemoComponent<SelectLabelOptions>((props) => {
  const htmlProps = useSelectLabel(props);
  return createElement("div", htmlProps);
});

export type SelectLabelOptions<T extends As = "div"> = Options<T> & {
  /**
   * Object returned by the `useSelectState` hook. If not provided, the parent
   * `Select` component's context will be used.
   */
  state: SelectState;
};

export type SelectLabelProps<T extends As = "label"> = Props<
  SelectLabelOptions<T>
>;
