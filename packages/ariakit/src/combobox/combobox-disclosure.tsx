import { MouseEvent } from "react";
import { useEvent } from "ariakit-utils/hooks";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { As, Props } from "ariakit-utils/types";
import {
  DialogDisclosureOptions,
  useDialogDisclosure,
} from "../dialog/dialog-disclosure";
import { ComboboxState } from "./combobox-state";

const children = (
  <svg
    aria-hidden="true"
    display="block"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.5pt"
    viewBox="0 0 16 16"
    height="1em"
    width="1em"
    pointerEvents="none"
  >
    <polyline points="4,6 8,10 12,6" />
  </svg>
);

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a combobox disclosure button.
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx
 * const state = useComboboxState();
 * const props = useComboboxDisclosure({ state });
 * <Combobox state={state} />
 * <Role {...props} />
 * <ComboboxPopover state={state}>
 *   <ComboboxItem value="Item 1" />
 *   <ComboboxItem value="Item 2" />
 *   <ComboboxItem value="Item 3" />
 * </ComboboxPopover>
 * ```
 */
export const useComboboxDisclosure = createHook<ComboboxDisclosureOptions>(
  ({ state, ...props }) => {
    const onMouseDownProp = props.onMouseDown;

    const onMouseDown = useEvent((event: MouseEvent<HTMLButtonElement>) => {
      onMouseDownProp?.(event);
      // We have to prevent the element from getting focused on mousedown.
      event.preventDefault();
      // This will immediately move focus to the combobox input.
      state.move(null);
    });

    const onClickProp = props.onClick;

    const onClick = useEvent((event: MouseEvent<HTMLButtonElement>) => {
      onClickProp?.(event);
      if (event.defaultPrevented) return;
      state.disclosureRef.current = state.baseRef.current;
    });

    const label = state.open ? "Hide popup" : "Show popup";

    props = {
      children,
      tabIndex: -1,
      "aria-label": label,
      ...props,
      onMouseDown,
      onClick,
    };

    // We're using DialogDisclosure, and not PopoverDisclosure, because
    // PopoverDisclosure will also update the `state.anchorRef` with the
    // disclosure element. We need to keep the combobox input as the anchorRef.
    props = useDialogDisclosure({ state, ...props });

    return props;
  }
);

/**
 * A component that renders a combobox disclosure button that toggles the
 * combobox popover visibility when clicked.
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx
 * const combobox = useComboboxState();
 * <Combobox state={combobox} />
 * <ComboboxDisclosure state={combobox} />
 * <ComboboxPopover state={combobox}>
 *   <ComboboxItem value="Item 1" />
 *   <ComboboxItem value="Item 2" />
 *   <ComboboxItem value="Item 3" />
 * </ComboboxPopover>
 * ```
 */
export const ComboboxDisclosure = createComponent<ComboboxDisclosureOptions>(
  (props) => {
    const htmlProps = useComboboxDisclosure(props);
    return createElement("button", htmlProps);
  }
);

if (process.env.NODE_ENV !== "production") {
  ComboboxDisclosure.displayName = "ComboboxDisclosure";
}

export type ComboboxDisclosureOptions<T extends As = "button"> = Omit<
  DialogDisclosureOptions<T>,
  "state"
> & {
  /**
   * Object returned by the `useComboboxState` hook.
   */
  state: ComboboxState;
};

export type ComboboxDisclosureProps<T extends As = "button"> = Props<
  ComboboxDisclosureOptions<T>
>;
