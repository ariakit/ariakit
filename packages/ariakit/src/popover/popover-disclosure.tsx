import { MouseEvent } from "react";
import { useEvent, useWrapElement } from "ariakit-react-utils/hooks";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-react-utils/system";
import { As, Props } from "ariakit-react-utils/types";
import {
  DialogDisclosureOptions,
  useDialogDisclosure,
} from "../dialog/dialog-disclosure";
import { PopoverContext } from "./__utils";
import { PopoverAnchorOptions, usePopoverAnchor } from "./popover-anchor";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a button that controls the visibility of the
 * popover when clicked.
 * @see https://ariakit.org/components/popover
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
    const onClickProp = props.onClick;

    const onClick = useEvent((event: MouseEvent<HTMLButtonElement>) => {
      state.anchorRef.current = event.currentTarget;
      onClickProp?.(event);
    });

    props = useWrapElement(
      props,
      (element) => (
        <PopoverContext.Provider value={state}>
          {element}
        </PopoverContext.Provider>
      ),
      [state]
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
 * @see https://ariakit.org/components/popover
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

if (process.env.NODE_ENV !== "production") {
  PopoverDisclosure.displayName = "PopoverDisclosure";
}

export type PopoverDisclosureOptions<T extends As = "button"> = Omit<
  DialogDisclosureOptions<T>,
  "state"
> &
  PopoverAnchorOptions<T>;

export type PopoverDisclosureProps<T extends As = "button"> = Props<
  PopoverDisclosureOptions<T>
>;
