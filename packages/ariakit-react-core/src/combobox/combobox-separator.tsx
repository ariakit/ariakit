import { invariant } from "@ariakit/core/utils/misc";
import type { ElementType } from "react";
import type { CompositeSeparatorOptions } from "../composite/composite-separator.tsx";
import { useCompositeSeparator } from "../composite/composite-separator.tsx";
import { createElement, createHook, forwardRef } from "../utils/system.tsx";
import type { Props } from "../utils/types.ts";
import { useComboboxScopedContext } from "./combobox-context.tsx";
import type { ComboboxStore } from "./combobox-store.ts";

const TagName = "hr" satisfies ElementType;
type TagName = typeof TagName;

/**
 * Returns props a `ComboboxSeparator` component for combobox items.
 * @deprecated Use `useComboboxGroup` with CSS borders instead.
 * @see https://ariakit.com/components/combobox
 * @example
 * ```jsx
 * const store = useComboboxStore();
 * const props = useComboboxSeparator({ store });
 * <ComboboxPopover store={store}>
 *   <ComboboxItem value="Item 1" />
 *   <Role {...props} />
 *   <ComboboxItem value="Item 2" />
 *   <ComboboxItem value="Item 3" />
 * </ComboboxPopover>
 * ```
 */
export const useComboboxSeparator = createHook<
  TagName,
  ComboboxSeparatorOptions
>(function useComboboxSeparator({ store, ...props }) {
  const context = useComboboxScopedContext();
  store = store || context;

  invariant(
    store,
    process.env.NODE_ENV !== "production" &&
      "ComboboxSeparator must be wrapped in a ComboboxList or ComboboxPopover component.",
  );

  props = useCompositeSeparator({ store, ...props });
  return props;
});

/**
 * Renders a divider between
 * [`ComboboxItem`](https://ariakit.com/reference/combobox-item) elements.
 * @deprecated Use
 * [`ComboboxGroup`](https://ariakit.com/reference/combobox-group) with CSS
 * borders instead.
 * @see https://ariakit.com/components/combobox
 * @example
 * ```jsx {5}
 * <ComboboxProvider>
 *   <Combobox />
 *   <ComboboxPopover>
 *     <ComboboxItem value="Item 1" />
 *     <ComboboxSeparator />
 *     <ComboboxItem value="Item 2" />
 *     <ComboboxItem value="Item 3" />
 *   </ComboboxPopover>
 * </ComboboxProvider>
 * ```
 */
export const ComboboxSeparator = forwardRef(function ComboboxSeparator(
  props: ComboboxSeparatorProps,
) {
  const htmlProps = useComboboxSeparator(props);
  return createElement(TagName, htmlProps);
});

export interface ComboboxSeparatorOptions<
  T extends ElementType = TagName,
> extends CompositeSeparatorOptions<T> {
  /**
   * Object returned by the
   * [`useComboboxStore`](https://ariakit.com/reference/use-combobox-store)
   * hook. If not provided, the closest
   * [`ComboboxList`](https://ariakit.com/reference/combobox-list) or
   * [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover)
   * components' context will be used.
   */
  store?: ComboboxStore;
}

export type ComboboxSeparatorProps<T extends ElementType = TagName> = Props<
  T,
  ComboboxSeparatorOptions<T>
>;
