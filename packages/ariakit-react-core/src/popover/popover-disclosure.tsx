import type { MouseEvent } from "react";
import { invariant } from "@ariakit/core/utils/misc";
import type { DialogDisclosureOptions } from "../dialog/dialog-disclosure.js";
import { useDialogDisclosure } from "../dialog/dialog-disclosure.js";
import { useEvent, useWrapElement } from "../utils/hooks.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import type { PopoverAnchorOptions } from "./popover-anchor.js";
import { usePopoverAnchor } from "./popover-anchor.js";
import {
  PopoverScopedContextProvider,
  usePopoverProviderContext,
} from "./popover-context.js";

/**
 * Returns props to create a `PopoverDisclosure` component.
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
    const context = usePopoverProviderContext();
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "PopoverDisclosure must receive a `store` prop or be wrapped in a PopoverProvider component.",
    );

    const onClickProp = props.onClick;

    const onClick = useEvent((event: MouseEvent<HTMLButtonElement>) => {
      store?.setAnchorElement(event.currentTarget);
      onClickProp?.(event);
    });

    props = useWrapElement(
      props,
      (element) => (
        <PopoverScopedContextProvider value={store}>
          {element}
        </PopoverScopedContextProvider>
      ),
      [store],
    );

    props = {
      ...props,
      onClick,
    };

    props = usePopoverAnchor({ store, ...props });
    props = useDialogDisclosure({ store, ...props });

    return props;
  },
);

/**
 * Renders a button that controls the visibility of the popover when clicked.
 * @see https://ariakit.org/components/popover
 * @example
 * ```jsx
 * <PopoverProvider>
 *   <PopoverDisclosure>Disclosure</PopoverDisclosure>
 *   <Popover>Popover</Popover>
 * </PopoverProvider>
 * ```
 */
export const PopoverDisclosure = createComponent<PopoverDisclosureOptions>(
  (props) => {
    const htmlProps = usePopoverDisclosure(props);
    return createElement("button", htmlProps);
  },
);

if (process.env.NODE_ENV !== "production") {
  PopoverDisclosure.displayName = "PopoverDisclosure";
}

export interface PopoverDisclosureOptions<T extends As = "button">
  extends PopoverAnchorOptions<T>,
    Omit<DialogDisclosureOptions<T>, "store"> {}

export type PopoverDisclosureProps<T extends As = "button"> = Props<
  PopoverDisclosureOptions<T>
>;
