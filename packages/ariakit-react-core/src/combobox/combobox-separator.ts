import { useContext } from "react";
import { invariant } from "@ariakit/core/utils/misc";
import type { CompositeSeparatorOptions } from "../composite/composite-separator.js";
import { useCompositeSeparator } from "../composite/composite-separator.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import { ComboboxContext } from "./combobox-context.js";
import type { ComboboxStore } from "./combobox-store.js";

/**
 * Returns props a `ComboboxSeparator` component for combobox items.
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
export const useComboboxSeparator = createHook<ComboboxSeparatorOptions>(
  ({ store, ...props }) => {
    const context = useContext(ComboboxContext);
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "ComboboxSeparator must be wrapped in a ComboboxList or ComboboxPopover component"
    );

    props = useCompositeSeparator({ store, ...props });
    return props;
  }
);

/**
 * Renders a separator element for combobox items
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx
 * const combobox = useComboboxStore();
 * <Combobox store={combobox} />
 * <ComboboxPopover store={combobox}>
 *   <ComboboxItem value="Item 1" />
 *   <ComboboxSeparator />
 *   <ComboboxItem value="Item 2" />
 *   <ComboboxItem value="Item 3" />
 * </ComboboxPopover>
 * ```
 */
export const ComboboxSeparator = createComponent<ComboboxSeparatorOptions>(
  (props) => {
    const htmlProps = useComboboxSeparator(props);
    return createElement("hr", htmlProps);
  }
);

if (process.env.NODE_ENV !== "production") {
  ComboboxSeparator.displayName = "ComboboxSeparator";
}

export interface ComboboxSeparatorOptions<T extends As = "hr">
  extends CompositeSeparatorOptions<T> {
  /**
   * Object returned by the `useComboboxStore` hook. If not provided, the parent
   * `ComboboxList` or `ComboboxPopover` components' context will be used.
   */
  store?: ComboboxStore;
}

export type ComboboxSeparatorProps<T extends As = "hr"> = Props<
  ComboboxSeparatorOptions<T>
>;
