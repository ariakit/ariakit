import type { ElementType } from "react";
import { getPopupRole } from "@ariakit/core/utils/dom";
import { invariant } from "@ariakit/core/utils/misc";
import type { CompositeGroupOptions } from "../composite/composite-group.js";
import { useCompositeGroup } from "../composite/composite-group.js";
import { createElement, createHook, forwardRef } from "../utils/system.js";
import type { Props } from "../utils/types.js";
import { useComboboxScopedContext } from "./combobox-context.js";
import type { ComboboxStore } from "./combobox-store.js";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;

/**
 * Returns props to create a `ComboboxGroup` component.
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx
 * const store = useComboboxStore();
 * const props = useComboboxGroup({ store });
 * <Combobox store={store} />
 * <ComboboxPopover store={store}>
 *   <Role {...props}>
 *     <ComboboxGroupLabel>Label</ComboboxGroupLabel>
 *     <ComboboxItem value="Item 1" />
 *     <ComboboxItem value="Item 2" />
 *   </Role>
 * </ComboboxPopover>
 * ```
 */
export const useComboboxGroup = createHook<TagName, ComboboxGroupOptions>(
  function useComboboxGroup({ store, ...props }) {
    const context = useComboboxScopedContext();
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "ComboboxRow must be wrapped in a ComboboxList or ComboboxPopover component",
    );

    const contentElement = store.useState("contentElement");
    const popupRole = getPopupRole(contentElement);

    if (popupRole === "grid") {
      props = { role: "rowgroup", ...props };
    }

    props = useCompositeGroup({ store, ...props });

    return props;
  },
);

/**
 * Renders a group for
 * [`ComboboxItem`](https://ariakit.org/reference/combobox-item) elements.
 * Optionally, a
 * [`ComboboxGroupLabel`](https://ariakit.org/reference/combobox-group-label)
 * can be rendered as a child to provide a label for the group.
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx {4-8}
 * <ComboboxProvider>
 *   <Combobox />
 *   <ComboboxPopover>
 *     <ComboboxGroup>
 *       <ComboboxGroupLabel>Fruits</ComboboxGroupLabel>
 *       <ComboboxItem value="Apple" />
 *       <ComboboxItem value="Banana" />
 *     </ComboboxGroup>
 *   </ComboboxPopover>
 * </ComboboxProvider>
 * ```
 */
export const ComboboxGroup = forwardRef(function ComboboxGroup(
  props: ComboboxGroupProps,
) {
  const htmlProps = useComboboxGroup(props);
  return createElement(TagName, htmlProps);
});

export interface ComboboxGroupOptions<T extends ElementType = TagName>
  extends CompositeGroupOptions<T> {
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

export type ComboboxGroupProps<T extends ElementType = TagName> = Props<
  T,
  ComboboxGroupOptions<T>
>;
