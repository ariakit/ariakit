import { MouseEvent } from "react";
import {
  DialogDisclosureOptions,
  useDialogDisclosure,
} from "../dialog/dialog-disclosure";
import { useEvent, useWrapElement } from "../utils/hooks";
import { createComponent, createElement, createHook } from "../utils/system";
import { As, Props } from "../utils/types";
import { PopoverAnchorOptions, usePopoverAnchor } from "./popover-anchor";
import { PopoverContext } from "./popover-context";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a button that controls the visibility of the
 * popover when clicked.
 * @see https://ariakit.org/components/popover
 * @example
 * ```jsx
 * const store = usePopoverStore();
 * const props = usePopoverDisclosure({ store });
 * <Role {...props}>Disclosure</Role>
 * <Popover store={store}>Popover</Popover>
 * ```
 */
export const usePopoverDisclosure = createHook<PopoverDisclosureOptions>(
  ({ store, ...props }) => {
    const onClickProp = props.onClick;

    const onClick = useEvent((event: MouseEvent<HTMLButtonElement>) => {
      store.setAnchorElement(event.currentTarget);
      onClickProp?.(event);
    });

    props = useWrapElement(
      props,
      (element) => (
        <PopoverContext.Provider value={store}>
          {element}
        </PopoverContext.Provider>
      ),
      [store]
    );

    props = {
      ...props,
      onClick,
    };

    props = usePopoverAnchor({ store, ...props });
    props = useDialogDisclosure({ store, ...props });

    return props;
  }
);

/**
 * A component that renders a button that controls the visibility of the popover
 * when clicked.
 * @see https://ariakit.org/components/popover
 * @example
 * ```jsx
 * const popover = usePopoverStore();
 * <PopoverDisclosure store={popover}>Disclosure</PopoverDisclosure>
 * <Popover store={popover}>Popover</Popover>
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
  "store"
> &
  PopoverAnchorOptions<T>;

export type PopoverDisclosureProps<T extends As = "button"> = Props<
  PopoverDisclosureOptions<T>
>;
