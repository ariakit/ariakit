import { MouseEvent, useCallback } from "react";
import {
  createHook,
  createComponent,
  createElement,
} from "ariakit-utils/system";
import { useEventCallback } from "ariakit-utils/hooks";
import { As, Props } from "ariakit-utils/types";
import {
  DialogDisclosureOptions,
  useDialogDisclosure,
} from "../dialog/dialog-disclosure";
import { PopoverAnchorOptions, usePopoverAnchor } from "./popover-anchor";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a button that controls the visibility of the
 * popover when clicked.
 * @see https://ariakit.org/docs/popover
 * @example
 * ```jsx
 * const state = usePopoverState();
 * const props = usePopoverDisclosure({ state });
 * <Role {...props}>Disclosure</Role>
 * <Popover state={state}>Popover</Popover>
 * ```
 */
export const usePopoverDisclosure = createHook<PopoverDisclosureOptions>(
  ({ state, ...props }) => {
    const onClickProp = useEventCallback(props.onClick);

    const onClick = useCallback(
      (event: MouseEvent<HTMLButtonElement>) => {
        state.anchorRef.current = event.currentTarget;
        state.setAnchorRect(null);
        onClickProp(event);
      },
      [state.anchorRef, state.setAnchorRect, onClickProp]
    );

    props = {
      ...props,
      onClick,
    };

    props = usePopoverAnchor({ state, ...props });
    props = useDialogDisclosure({ state, ...props });

    return props;
  }
);

/**
 * A component that renders a button that controls the visibility of the popover
 * when clicked.
 * @see https://ariakit.org/docs/popover
 * @example
 * ```jsx
 * const popover = usePopoverState();
 * <PopoverDisclosure state={popover}>Disclosure</PopoverDisclosure>
 * <Popover state={popover}>Popover</Popover>
 * ```
 */
export const PopoverDisclosure = createComponent<PopoverDisclosureOptions>(
  (props) => {
    const htmlProps = usePopoverDisclosure(props);
    return createElement("button", htmlProps);
  }
);

export type PopoverDisclosureOptions<T extends As = "button"> = Omit<
  DialogDisclosureOptions<T>,
  "state"
> &
  PopoverAnchorOptions<T>;

export type PopoverDisclosureProps<T extends As = "button"> = Props<
  PopoverDisclosureOptions<T>
>;
