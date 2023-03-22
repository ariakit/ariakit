import { useForkRef } from "../utils/hooks.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
import { As, Options, Props } from "../utils/types.js";
import { PopoverStore } from "./popover-store.js";

/**
 * Returns props to create a `PopoverAnchor` component.
 * @see https://ariakit.org/components/popover
 * @example
 * ```jsx
 * const store = usePopoverStore();
 * const props = usePopoverAnchor({ store });
 * <Role {...props}>Anchor</Role>
 * <Popover store={store}>Popover</Popover>
 * ```
 */
export const usePopoverAnchor = createHook<PopoverAnchorOptions>(
  ({ store, ...props }) => {
    props = {
      ...props,
      ref: useForkRef(store.setAnchorElement, props.ref),
    };
    return props;
  }
);

/**
 * Renders an element that will serve as the popover's anchor. The popover will
 * be positioned relative to this element.
 * @see https://ariakit.org/components/popover
 * @example
 * ```jsx
 * const popover = usePopoverStore();
 * <PopoverAnchor store={popover}>Anchor</PopoverAnchor>
 * <Popover store={popover}>Popover</Popover>
 * ```
 */
export const PopoverAnchor = createComponent<PopoverAnchorOptions>((props) => {
  const htmlProps = usePopoverAnchor(props);
  return createElement("div", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  PopoverAnchor.displayName = "PopoverAnchor";
}

export interface PopoverAnchorOptions<T extends As = "div"> extends Options<T> {
  /**
   * Object returned by the `usePopoverStore` hook.
   */
  store: PopoverStore;
}

export type PopoverAnchorProps<T extends As = "div"> = Props<
  PopoverAnchorOptions<T>
>;
