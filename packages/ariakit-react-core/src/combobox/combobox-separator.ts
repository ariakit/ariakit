import type { ElementType } from "react";
import { invariant } from "@ariakit/core/utils/misc";
import type { CompositeSeparatorOptions } from "../composite/composite-separator.js";
import { useCompositeSeparator } from "../composite/composite-separator.js";
import { createElement, createHook2, forwardRef } from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import { useComboboxScopedContext } from "./combobox-context.js";
import type { ComboboxStore } from "./combobox-store.js";

const TagName = "hr" satisfies ElementType;
type TagName = typeof TagName;

/**
 * Returns props a `ComboboxSeparator` component for combobox items.
 * @deprecated Use `useComboboxGroup` with CSS borders instead.
 * @see https://ariakit.org/components/combobox
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
export const useComboboxSeparator = createHook2<
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
 * [`ComboboxItem`](https://ariakit.org/reference/combobox-item) elements.
 * @deprecated Use
 * [`ComboboxGroup`](https://ariakit.org/reference/combobox-group) with CSS
 * borders instead.
 * @see https://ariakit.org/components/combobox
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

export interface ComboboxSeparatorOptions<T extends ElementType = TagName>
  extends CompositeSeparatorOptions<T> {
  /**
   * Object returned by the
   * [`useComboboxStore`](https://ariakit.org/reference/use-combobox-store)
   * hook. If not provided, the closest
   * [`ComboboxList`](https://ariakit.org/reference/combobox-list) or
   * [`ComboboxPopover`](https://ariakit.org/reference/combobox-popover)
   * components' context will be used.
   */
  store?: ComboboxStore;
}

export type ComboboxSeparatorProps<T extends ElementType = TagName> = Props<
  ComboboxSeparatorOptions<T>
>;
