import type { ElementType } from "react";
import type { PopoverDismissOptions } from "../popover/popover-dismiss.tsx";
import { usePopoverDismiss } from "../popover/popover-dismiss.tsx";
import { createElement, createHook, forwardRef } from "../utils/system.tsx";
import type { Props } from "../utils/types.ts";
import { useSelectScopedContext } from "./select-context.tsx";
import type { SelectStore } from "./select-store.ts";

const TagName = "button" satisfies ElementType;
type TagName = typeof TagName;

/**
 * Returns props to create a `SelectDismiss` component.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx
 * const props = useSelectDismiss();
 * <Role.button {...props} />
 * ```
 */
export const useSelectDismiss = createHook<TagName, SelectDismissOptions>(
  function useSelectDismiss({ store, ...props }) {
    const context = useSelectScopedContext();
    store = store || context;
    props = usePopoverDismiss({ store, ...props });
    return props;
  },
);

/**
 * Renders a button that hides a
 * [`SelectPopover`](https://ariakit.org/reference/select-popover) component
 * when clicked.
 *
 * When this component is rendered within
 * [`SelectPopover`](https://ariakit.org/reference/select-popover), all
 * [`SelectItem`](https://ariakit.org/reference/select-item) elements must be
 * rendered within a [`SelectList`](https://ariakit.org/reference/select-list)
 * instead of directly within the popover.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx {4}
 * <SelectProvider>
 *   <Select />
 *   <SelectPopover>
 *     <SelectDismiss />
 *     <SelectList>
 *       <SelectItem value="Apple" />
 *       <SelectItem value="Orange" />
 *     </SelectList>
 *   </SelectPopover>
 * </SelectProvider>
 * ```
 */
export const SelectDismiss = forwardRef(function SelectDismiss(
  props: SelectDismissProps,
) {
  const htmlProps = useSelectDismiss(props);
  return createElement(TagName, htmlProps);
});

export interface SelectDismissOptions<T extends ElementType = TagName>
  extends PopoverDismissOptions<T> {
  /**
   * Object returned by the
   * [`useSelectStore`](https://ariakit.org/reference/use-select-store) hook.
   * If not provided, the closest
   * [`Select`](https://ariakit.org/reference/select) or
   * [`SelectProvider`](https://ariakit.org/reference/select-provider)
   * components' context will be used.
   */
  store?: SelectStore;
}

export type SelectDismissProps<T extends ElementType = TagName> = Props<
  T,
  SelectDismissOptions<T>
>;
