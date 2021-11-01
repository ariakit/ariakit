import { useState } from "react";
import {
  createHook,
  createComponent,
  createElement,
} from "ariakit-utils/system";
import { As, Props } from "ariakit-utils/types";
import { matches } from "ariakit-utils/dom";
import { useUpdateEffect } from "ariakit-utils/hooks";
import { PopoverOptions, usePopover } from "../popover/popover";
import { ComboboxListOptions, useComboboxList } from "./combobox-list";

function isController(
  target: EventTarget | Element | null,
  ...ids: Array<string | undefined>
) {
  if (!target) return false;
  if ("id" in target) {
    const selector = ids
      .filter(Boolean)
      .map((id) => `[aria-controls="${id}"]`)
      .join(", ");
    if (!selector) return false;
    return matches(target, selector);
  }
  return false;
}

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a combobox popover.
 * @see https://ariakit.org/docs/combobox
 * @example
 * ```jsx
 * const state = useComboboxState();
 * const props = useComboboxPopover({ state });
 * <Role {...props}>
 *   <ComboboxItem value="Item 1" />
 *   <ComboboxItem value="Item 2" />
 *   <ComboboxItem value="Item 3" />
 * </Role>
 * ```
 */
export const useComboboxPopover = createHook<ComboboxPopoverOptions>(
  ({ state, tabIndex, hideOnInteractOutside = true, ...props }) => {
    // We don't want to auto focus on hide when the popover is closed via an
    // interaction outside of the combobox. So we keep track of this state here.
    const [autoFocusOnHide, setAutoFocusOnHide] = useState(
      props.autoFocusOnHide
    );

    useUpdateEffect(() => {
      // Whenever the autoFocusOnHide state changes, we need to reset it to the
      // original value passed to the hook.
      setAutoFocusOnHide(props.autoFocusOnHide);
    }, [autoFocusOnHide, props.autoFocusOnHide]);

    props = useComboboxList({ state, ...props });
    props = usePopover({
      state,
      autoFocusOnShow: false,
      finalFocusRef: state.baseRef,
      ...props,
      autoFocusOnHide,
      // Make sure we don't hide the popover when the user interacts with the
      // combobox cancel or the combobox disclosure buttons. They will have the
      // aria-controls attribute pointing to either the combobox input or the
      // comboobx popover elements.
      hideOnInteractOutside: (event) => {
        const contentId = state.contentElement?.id;
        const baseId = state.baseRef.current?.id;
        if (isController(event.target, contentId, baseId)) return false;
        const result =
          typeof hideOnInteractOutside === "function"
            ? hideOnInteractOutside(event)
            : hideOnInteractOutside;
        if (!result) return false;
        // When an interaction outside such as a click on the body hides the
        // combobox popover, we don't want to move focus to the combobox input,
        // so we temporarily set the autoFocusOnHide prop to false here (this
        // will be reset on the next render).
        setAutoFocusOnHide(false);
        return true;
      },
    });
    return props;
  }
);

/**
 * A component that renders a combobox popover. The `role` prop is set to
 * `listbox` by default, but can be overriden by any other valid combobox popup
 * role (`listbox`, `menu`, `tree`, `grid` or `dialog`). The `aria-labelledby`
 * prop is set to the combobox input element's `id` by default.
 * @see https://ariakit.org/docs/combobox
 * @example
 * ```jsx
 * const combobox = useComboboxState();
 * <Combobox state={combobox} />
 * <ComboboxPopover state={combobox}>
 *   <ComboboxItem value="Item 1" />
 *   <ComboboxItem value="Item 2" />
 *   <ComboboxItem value="Item 3" />
 * </ComboboxPopover>
 * ```
 */
export const ComboboxPopover = createComponent<ComboboxPopoverOptions>(
  (props) => {
    const htmlProps = useComboboxPopover(props);
    return createElement("div", htmlProps);
  }
);

export type ComboboxPopoverOptions<T extends As = "div"> =
  ComboboxListOptions<T> & Omit<PopoverOptions<T>, "state">;

export type ComboboxPopoverProps<T extends As = "div"> = Props<
  ComboboxPopoverOptions<T>
>;
