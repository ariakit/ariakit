import type { ElementType } from "react";
import { useMergeRefs } from "../utils/hooks.ts";
import { createElement, createHook, forwardRef } from "../utils/system.tsx";
import type { Options, Props } from "../utils/types.ts";
import { usePopoverProviderContext } from "./popover-context.tsx";
import type { PopoverStore } from "./popover-store.ts";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;

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
export const usePopoverAnchor = createHook<TagName, PopoverAnchorOptions>(
  function usePopoverAnchor({ store, ...props }) {
    const context = usePopoverProviderContext();
    store = store || context;
    props = {
      ...props,
      ref: useMergeRefs(store?.setAnchorElement, props.ref),
    };
    return props;
  },
);

/**
 * Renders an element that acts as the anchor for the popover. The
 * [`Popover`](https://ariakit.org/reference/popover) component will be
 * positioned in relation to this element.
 * @see https://ariakit.org/components/popover
 * @example
 * ```jsx {2}
 * <PopoverProvider>
 *   <PopoverAnchor>Anchor</PopoverAnchor>
 *   <Popover>Popover</Popover>
 * </PopoverProvider>
 * ```
 */
export const PopoverAnchor = forwardRef(function PopoverAnchor(
  props: PopoverAnchorProps,
) {
  const htmlProps = usePopoverAnchor(props);
  return createElement(TagName, htmlProps);
});

export interface PopoverAnchorOptions<_T extends ElementType = TagName>
  extends Options {
  /**
   * Object returned by the
   * [`usePopoverStore`](https://ariakit.org/reference/use-popover-store) hook.
   * If not provided, the closest
   * [`PopoverProvider`](https://ariakit.org/reference/popover-provider)
   * component's context will be used.
   */
  store?: PopoverStore;
}

export type PopoverAnchorProps<T extends ElementType = TagName> = Props<
  T,
  PopoverAnchorOptions<T>
>;
