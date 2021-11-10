import { MouseEvent, useCallback } from "react";
import { useEventCallback, useRefId } from "ariakit-utils/hooks";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { As, Props } from "ariakit-utils/types";
import { ButtonOptions, useButton } from "../button";
import { ComboboxState } from "./combobox-state";

const children = (
  <svg
    aria-hidden="true"
    display="block"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1pt"
    width="1em"
    height="1em"
    pointerEvents="none"
  >
    <line x1="5" y1="5" x2="11" y2="11" />
    <line x1="5" y1="11" x2="11" y2="5" />
  </svg>
);

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a combobox cancel button that clears the combobox
 * input when clicked.
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx
 * const state = useComboboxState();
 * const props = useComboboxCancel({ state });
 * <Combobox state={state} />
 * <Role {...props} />
 * ```
 */
export const useComboboxCancel = createHook<ComboboxCancelOptions>(
  ({ state, ...props }) => {
    const onClickProp = useEventCallback(props.onClick);

    const onClick = useCallback(
      (event: MouseEvent<HTMLButtonElement>) => {
        onClickProp(event);
        if (event.defaultPrevented) return;
        state.setValue("");
        // Move focus to the combobox input.
        state.move(null);
      },
      [onClickProp, state.setValue, state.move]
    );

    const comboboxId = useRefId(state.baseRef);

    props = {
      children,
      "aria-label": "Clear input",
      // This aria-controls will ensure the combobox popup remains visible when
      // this element gets focused. This logic is done in the ComboboxPopover
      // component.
      "aria-controls": comboboxId,
      ...props,
      onClick,
    };

    props = useButton(props);

    return props;
  }
);

/**
 * A component that renders a combobox cancel button that clears the combobox
 * input when clicked.
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx
 * const combobox = useComboboxState();
 * <Combobox state={combobox} />
 * <ComboboxCancel state={combobox} />
 * <ComboboxPopover state={combobox}>
 *   <ComboboxItem value="Item 1" />
 *   <ComboboxItem value="Item 2" />
 *   <ComboboxItem value="Item 3" />
 * </ComboboxPopover>
 * ```
 */
export const ComboboxCancel = createComponent<ComboboxCancelOptions>(
  (props) => {
    const htmlProps = useComboboxCancel(props);
    return createElement("button", htmlProps);
  }
);

export type ComboboxCancelOptions<T extends As = "button"> =
  ButtonOptions<T> & {
    /**
     * Object returned by the `useComboboxState` hook.
     */
    state: ComboboxState;
  };

export type ComboboxClearProps<T extends As = "button"> = Props<
  ComboboxCancelOptions<T>
>;
