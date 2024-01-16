import { useMergeRefs } from "../utils/hooks.js";
import { createElement, createHook2 } from "../utils/system.js";
import type { Options2, Props2 } from "../utils/types.js";
import { usePopoverProviderContext } from "./popover-context.js";
import type { PopoverStore } from "./popover-store.js";

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
export const usePopoverAnchor = createHook2<TagName, PopoverAnchorOptions>(
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
  extends Options2 {
  /**
   * Object returned by the
   * [`usePopoverStore`](https://ariakit.org/reference/use-popover-store) hook.
   * If not provided, the closest
   * [`PopoverProvider`](https://ariakit.org/reference/popover-provider)
   * component's context will be used.
   */
  store?: PopoverStore;
}

export type PopoverAnchorProps<T extends ElementType = TagName> = Props2<
  T,
  PopoverAnchorOptions<T>
>;
