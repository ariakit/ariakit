import { getPopupRole } from "@ariakit/core/utils/dom";
import { invariant } from "@ariakit/core/utils/misc";
import type { ElementType } from "react";
import type { CompositeGroupOptions } from "../composite/composite-group.tsx";
import { useCompositeGroup } from "../composite/composite-group.tsx";
import { useStoreState } from "../utils/store.tsx";
import type { StoreProp } from "../utils/system.tsx";
import { createElement, createHook, forwardRef } from "../utils/system.tsx";
import type { Props } from "../utils/types.ts";
import { useComboboxScopedContextStore } from "./combobox-context.tsx";
import type { ComboboxStore } from "./combobox-store.ts";

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
    store = useComboboxScopedContextStore(store, "ComboboxGroup");

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "ComboboxRow must be wrapped in a ComboboxList or ComboboxPopover component",
    );

    const contentElement = useStoreState(store, "contentElement");
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

export interface ComboboxGroupOptions<
  T extends ElementType = TagName,
> extends CompositeGroupOptions<T> {
  /**
   * Object returned by the
   * [`useComboboxStore`](https://ariakit.org/reference/use-combobox-store)
   * hook.
   * This prop can also receive the corresponding
   * [`ComboboxProvider`](https://ariakit.org/reference/combobox-provider)
   * component, which makes the component read the store from that provider's
   * context explicitly.
   * If not provided, the closest
   * [`ComboboxProvider`](https://ariakit.org/reference/combobox-provider)
   * component's context will be used.
   */
  store?: StoreProp<ComboboxStore>;
}

export type ComboboxGroupProps<T extends ElementType = TagName> = Props<
  T,
  ComboboxGroupOptions<T>
>;
