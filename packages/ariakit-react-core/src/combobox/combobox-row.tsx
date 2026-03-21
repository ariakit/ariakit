import { getPopupRole } from "@ariakit/core/utils/dom";
import { invariant } from "@ariakit/core/utils/misc";
import type { ElementType } from "react";
import type { CompositeRowOptions } from "../composite/composite-row.tsx";
import { useCompositeRow } from "../composite/composite-row.tsx";
import { useStoreState } from "../utils/store.tsx";
import type { StoreProp } from "../utils/system.tsx";
import { createElement, createHook, forwardRef } from "../utils/system.tsx";
import type { Props } from "../utils/types.ts";
import { useComboboxScopedContextStore } from "./combobox-context.tsx";
import type { ComboboxStore } from "./combobox-store.ts";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;

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
export const useComboboxRow = createHook<TagName, ComboboxRowOptions>(
  function useComboboxRow({ store, ...props }) {
    store = useComboboxScopedContextStore(store, "ComboboxRow");

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "ComboboxRow must be wrapped in a ComboboxList or ComboboxPopover component",
    );

    const contentElement = useStoreState(store, "contentElement");
    const popupRole = getPopupRole(contentElement);
    const role = popupRole === "grid" ? "row" : "presentation";

    props = { role, ...props };

    props = useCompositeRow({ store, ...props });

    return props;
  },
);

/**
 * Renders a combobox row that allows two-dimensional arrow key navigation.
 * [`ComboboxItem`](https://ariakit.org/reference/combobox-item) elements
 * wrapped within this component will automatically receive a
 * [`rowId`](https://ariakit.org/reference/combobox-item#rowid) prop.
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx {4-13}
 * <ComboboxProvider>
 *   <Combobox />
 *   <ComboboxPopover>
 *     <ComboboxRow>
 *       <ComboboxItem value="Item 1.1" />
 *       <ComboboxItem value="Item 1.2" />
 *       <ComboboxItem value="Item 1.3" />
 *     </ComboboxRow>
 *     <ComboboxRow>
 *       <ComboboxItem value="Item 2.1" />
 *       <ComboboxItem value="Item 2.2" />
 *       <ComboboxItem value="Item 2.3" />
 *     </ComboboxRow>
 *   </ComboboxPopover>
 * </ComboboxProvider>
 * ```
 */
export const ComboboxRow = forwardRef(function ComboboxRow(
  props: ComboboxRowProps,
) {
  const htmlProps = useComboboxRow(props);
  return createElement(TagName, htmlProps);
});

export interface ComboboxRowOptions<
  T extends ElementType = TagName,
> extends CompositeRowOptions<T> {
  /**
   * Object returned by the
   * [`useComboboxStore`](https://ariakit.org/reference/use-combobox-store)
   * hook.
   * This prop can also receive the corresponding
   * [`ComboboxProvider`](https://ariakit.org/reference/combobox-provider)
   * component, which makes the component read the store from that provider's
   * context explicitly, or `null`, which disables context lookup.
   * If not provided, the closest
   * [`ComboboxProvider`](https://ariakit.org/reference/combobox-provider)
   * component's context will be used.
   */
  store?: StoreProp<ComboboxStore>;
}

export type ComboboxRowProps<T extends ElementType = TagName> = Props<
  T,
  ComboboxRowOptions<T>
>;
