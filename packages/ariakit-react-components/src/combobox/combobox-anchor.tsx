import { createElement, createHook, forwardRef } from "@ariakit/react-utils";
import type { Props } from "@ariakit/react-utils";
import type { ElementType } from "react";
import type { PopoverAnchorOptions } from "../popover/popover-anchor.tsx";
import { usePopoverAnchor } from "../popover/popover-anchor.tsx";
import { useComboboxProviderContext } from "./combobox-context.tsx";
import type { ComboboxStore } from "./combobox-store.ts";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;

/**
 * Returns props to create a `ComboboxAnchor` component.
 * @see https://ariakit.com/components/combobox
 * @example
 * ```jsx
 * const store = useComboboxStore();
 * const props = useComboboxAnchor({ store });
 * <Role {...props}>Anchor</Role>
 * <Combobox store={store} />
 * <ComboboxPopover store={store}>Content</ComboboxPopover>
 * ```
 */
export const useComboboxAnchor = createHook<TagName, ComboboxAnchorOptions>(
  function useComboboxAnchor({ store, ...props }) {
    const context = useComboboxProviderContext();
    store = store || context;
    return usePopoverAnchor({ store, ...props });
  },
);

/**
 * Renders an element that acts as the anchor for the
 * [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover)
 * component.
 * @see https://ariakit.com/components/combobox
 * @example
 * ```jsx {3}
 * <ComboboxProvider>
 *   <Combobox />
 *   <ComboboxAnchor>Anchor</ComboboxAnchor>
 *   <ComboboxPopover>Content</ComboboxPopover>
 * </ComboboxProvider>
 * ```
 */
export const ComboboxAnchor = forwardRef(function ComboboxAnchor(
  props: ComboboxAnchorProps,
) {
  const htmlProps = useComboboxAnchor(props);
  return createElement(TagName, htmlProps);
});

export interface ComboboxAnchorOptions<
  T extends ElementType = TagName,
> extends PopoverAnchorOptions<T> {
  /**
   * Object returned by the
   * [`useComboboxStore`](https://ariakit.com/reference/use-combobox-store)
   * hook. If not provided, the closest
   * [`ComboboxProvider`](https://ariakit.com/reference/combobox-provider)
   * component's context will be used.
   */
  store?: ComboboxStore;
}

export type ComboboxAnchorProps<T extends ElementType = TagName> = Props<
  T,
  ComboboxAnchorOptions<T>
>;
