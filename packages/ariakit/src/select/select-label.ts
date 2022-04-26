import { MouseEvent, useCallback } from "react";
import { useEventCallback, useForkRef, useId } from "ariakit-utils/hooks";
import { queueMicrotask } from "ariakit-utils/misc";
import { createMemoComponent } from "ariakit-utils/store";
import { createElement, createHook } from "ariakit-utils/system";
import { As, Options, Props } from "ariakit-utils/types";
import { SelectState } from "./select-state";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a label for the `Select` component. Since it's
 * not a native select element, we can't use the native label element. The
 * `SelectLabel` component will move focus and click on the `Select` component
 * when the user clicks on the label.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx
 * const state = useSelectState();
 * const props = useSelectLabel({ state });
 * <Role {...props}>Favorite fruit</Role>
 * <Select state={state} />
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
        // queueMicrotask will guarantee that the focus and click events will be
        // triggered only after the current event queue is flushed (which
        // includes this click event).
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
 * A component that renders a label for the `Select` component. Since it's not a
 * native select element, we can't use the native label element. The
 * `SelectLabel` component will move focus and click on the `Select` component
 * when the user clicks on the label.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx
 * const select = useSelectState({ defaultValue: "Apple" });
 * <SelectLabel state={select}>Favorite fruit</SelectLabel>
 * <Select state={select} />
 * <SelectPopover state={select}>
 *   <SelectItem value="Apple" />
 *   <SelectItem value="Orange" />
 * </SelectPopover>
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

export type SelectLabelProps<T extends As = "div"> = Props<
  SelectLabelOptions<T>
>;
