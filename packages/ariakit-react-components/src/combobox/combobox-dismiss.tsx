import { createElement, createHook, forwardRef } from "@ariakit/react-utils";
import type { Props } from "@ariakit/react-utils";
import type { ElementType } from "react";
import { withDefaultButtonType } from "../button/utils.ts";
import type { PopoverDismissOptions } from "../popover/popover-dismiss.tsx";
import { usePopoverDismiss } from "../popover/popover-dismiss.tsx";
import { useComboboxScopedContext } from "./combobox-context.tsx";
import type { ComboboxStore } from "./combobox-store.ts";

const TagName = "button" satisfies ElementType;
type TagName = typeof TagName;

/**
 * Returns props to create a `ComboboxDismiss` component.
 * @see https://ariakit.com/components/combobox
 */
export const useComboboxDismiss = createHook<TagName, ComboboxDismissOptions>(
  function useComboboxDismiss({ store, ...props }) {
    const context = useComboboxScopedContext();
    store = store || context;
    props = usePopoverDismiss({ store, ...props });
    return props;
  },
);

/**
 * Renders a button that hides a
 * [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover)
 * component when clicked.
 * @example
 * ```jsx {4}
 * <ComboboxProvider>
 *   <ComboboxSelect />
 *   <ComboboxPopover>
 *     <ComboboxDismiss />
 *     <ComboboxList>
 *       <ComboboxItem value="Apple" />
 *       <ComboboxItem value="Orange" />
 *     </ComboboxList>
 *   </ComboboxPopover>
 * </ComboboxProvider>
 * ```
 * @see https://ariakit.com/components/combobox
 */
export const ComboboxDismiss = forwardRef(function ComboboxDismiss(
  props: ComboboxDismissProps,
) {
  const htmlProps = useComboboxDismiss(withDefaultButtonType(props));
  return createElement(TagName, htmlProps);
});

export interface ComboboxDismissOptions<
  T extends ElementType = TagName,
> extends PopoverDismissOptions<T> {
  /**
   * Object returned by the
   * [`useComboboxStore`](https://ariakit.com/reference/use-combobox-store)
   * hook. If not provided, the closest
   * [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover) or
   * [`ComboboxList`](https://ariakit.com/reference/combobox-list) component's
   * context will be used.
   */
  store?: ComboboxStore;
}

export type ComboboxDismissProps<T extends ElementType = TagName> = Props<
  T,
  ComboboxDismissOptions<T>
>;
