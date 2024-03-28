import type { ElementType } from "react";
import type { PopoverArrowOptions } from "../popover/popover-arrow.tsx";
import { usePopoverArrow } from "../popover/popover-arrow.tsx";
import { createElement, createHook, forwardRef } from "../utils/system.tsx";
import type { Props } from "../utils/types.ts";
import { useHovercardContext } from "./hovercard-context.tsx";
import type { HovercardStore } from "./hovercard-store.ts";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;

/**
 * Returns props to create a `HovercardArrow` component.
 * @see https://ariakit.org/components/hovercard
 * @example
 * ```jsx
 * const store = useHovercardStore();
 * const props = useHovercardArrow({ store });
 * <Hovercard store={store}>
 *   <Role {...props} />
 *   Details
 * </Hovercard>
 * ```
 */
export const useHovercardArrow = createHook<TagName, HovercardArrowOptions>(
  function useHovercardArrow({ store, ...props }) {
    const context = useHovercardContext();
    store = store || context;
    props = usePopoverArrow({ store, ...props });
    return props;
  },
);

/**
 * Renders an arrow element inside a
 * [`Hovercard`](https://ariakit.org/reference/hovercard) component that points
 * to the anchor element.
 * @see https://ariakit.org/components/hovercard
 * @example
 * ```jsx {4}
 * <HovercardProvider>
 *   <HovercardAnchor>@username</HovercardAnchor>
 *   <Hovercard>
 *     <HovercardArrow />
 *     Details
 *   </Hovercard>
 * </HovercardProvider>
 * ```
 */
export const HovercardArrow = forwardRef(function HovercardArrow(
  props: HovercardArrowProps,
) {
  const htmlProps = useHovercardArrow(props);
  return createElement(TagName, htmlProps);
});

export interface HovercardArrowOptions<T extends ElementType = TagName>
  extends PopoverArrowOptions<T> {
  /**
   * Object returned by the
   * [`useHovercardStore`](https://ariakit.org/reference/use-hovercard-store)
   * hook. If not provided, the closest
   * [`Hovercard`](https://ariakit.org/reference/hovercard) or
   * [`HovercardProvider`](https://ariakit.org/reference/hovercard-provider)
   * components' context will be used.
   */
  store?: HovercardStore;
}

export type HovercardArrowProps<T extends ElementType = TagName> = Props<
  T,
  HovercardArrowOptions<T>
>;
