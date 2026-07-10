import {
  useMergeRefs,
  createElement,
  createHook,
  forwardRef,
  useStoreProp,
} from "@ariakit/react-utils";
import type { Options, Props, ProviderComponent } from "@ariakit/react-utils";
import type { ElementType } from "react";
import { usePopoverProviderContext } from "./popover-context.tsx";
import type { PopoverStore } from "./popover-store.ts";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;

/**
 * Returns props to create a `PopoverAnchor` component.
 * @see https://ariakit.com/components/popover
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
    store = useStoreProp(store, context);
    props = {
      ...props,
      ref: useMergeRefs(store?.setAnchorElement, props.ref),
    };
    return props;
  },
);

/**
 * Renders an element that acts as the anchor for the popover. The
 * [`Popover`](https://ariakit.com/reference/popover) component will be
 * positioned in relation to this element.
 * @see https://ariakit.com/components/popover
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

export interface PopoverAnchorOptions<
  _T extends ElementType = TagName,
> extends Options {
  /**
   * Object returned by the
   * [`usePopoverStore`](https://ariakit.com/reference/use-popover-store) hook.
   * If not provided, the closest
   * [`PopoverProvider`](https://ariakit.com/reference/popover-provider)
   * component's context will be used.
   *
   * You can also pass a provider component (for example,
   * [`PopoverProvider`](https://ariakit.com/reference/popover-provider)). In
   * that case, the store is read from the closest context of that provider's
   * kind (set by that provider, an extending provider, or a compatible
   * container component), skipping less specific store contexts.
   */
  store?: PopoverStore | ProviderComponent<PopoverStore>;
}

export type PopoverAnchorProps<T extends ElementType = TagName> = Props<
  T,
  PopoverAnchorOptions<T>
>;
