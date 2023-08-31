import { getPopupRole } from "@ariakit/core/utils/dom";
import { invariant } from "@ariakit/core/utils/misc";
import type { CompositeRowOptions } from "../composite/composite-row.js";
import { useCompositeRow } from "../composite/composite-row.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import { useComboboxScopedContext } from "./combobox-context.js";
import type { ComboboxStore } from "./combobox-store.js";

/**
 * Returns props to create a `ComboboxRow` component.
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx
 * const store = useComboboxStore();
 * const props = useComboboxRow({ store });
 * <ComboboxPopover store={store}>
 *   <Role {...props}>
 *     <ComboboxItem value="Item 1" />
 *     <ComboboxItem value="Item 2" />
 *     <ComboboxItem value="Item 3" />
 *   </Role>
 * </ComboboxPopover>
 * ```
 */
export const useComboboxRow = createHook<ComboboxRowOptions>(
  ({ store, ...props }) => {
    const context = useComboboxScopedContext();
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "ComboboxRow must be wrapped in a ComboboxList or ComboboxPopover component",
    );

    const contentElement = store.useState("contentElement");
    const popupRole = getPopupRole(contentElement);
    const role = popupRole === "grid" ? "row" : "presentation";

    props = { role, ...props };

    props = useCompositeRow({ store, ...props });

    return props;
  },
);

/**
 * Renders a combobox row.
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx
 * const combobox = useComboboxStore();
 * <Combobox store={combobox} />
 * <ComboboxPopover store={combobox}>
 *   <ComboboxRow>
 *     <ComboboxItem value="Item 1.1" />
 *     <ComboboxItem value="Item 1.2" />
 *     <ComboboxItem value="Item 1.3" />
 *   </ComboboxRow>
 *   <ComboboxRow>
 *     <ComboboxItem value="Item 2.1" />
 *     <ComboboxItem value="Item 2.2" />
 *     <ComboboxItem value="Item 2.3" />
 *   </ComboboxRow>
 * </ComboboxPopover>
 * ```
 */
export const ComboboxRow = createComponent<ComboboxRowOptions>((props) => {
  const htmlProps = useComboboxRow(props);
  return createElement("div", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  ComboboxRow.displayName = "ComboboxRow";
}

export interface ComboboxRowOptions<T extends As = "div">
  extends CompositeRowOptions<T> {
  /**
   * Object returned by the `useComboboxStore` hook. If not provided, the parent
   * `ComboboxList` or `ComboboxPopover` components' context will be used.
   */
  store?: ComboboxStore;
}

export type ComboboxRowProps<T extends As = "div"> = Props<
  ComboboxRowOptions<T>
>;
