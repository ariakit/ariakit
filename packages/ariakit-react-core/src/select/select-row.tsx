import type { ElementType } from "react";
import { getPopupRole } from "@ariakit/core/utils/dom";
import { invariant } from "@ariakit/core/utils/misc";
import type { CompositeRowOptions } from "../composite/composite-row.tsx";
import { useCompositeRow } from "../composite/composite-row.tsx";
import { createElement, createHook, forwardRef } from "../utils/system.tsx";
import type { Props } from "../utils/types.ts";
import { useSelectContext } from "./select-context.tsx";
import type { SelectStore } from "./select-store.ts";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;

/**
 * Returns props to create a `SelectRow` component.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx
 * const store = useSelectStore();
 * const props = useSelectRow({ store });
 * <SelectPopover store={store}>
 *   <Role {...props}>
 *     <SelectItem value="Apple" />
 *     <SelectItem value="Orange" />
 *   </Role>
 * </SelectPopover>
 * ```
 */
export const useSelectRow = createHook<TagName, SelectRowOptions>(
  function useSelectRow({ store, ...props }) {
    const context = useSelectContext();
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "SelectRow must be wrapped in a SelectList or SelectPopover component",
    );

    const listElement = store.useState("listElement");
    const popupRole = getPopupRole(listElement);
    const role = popupRole === "grid" ? "row" : "presentation";

    props = { role, ...props };

    props = useCompositeRow({ store, ...props });

    return props;
  },
);

/**
 * Renders a select row that allows two-dimensional arrow key navigation.
 * [`SelectItem`](https://ariakit.org/reference/select-item) elements wrapped
 * within this component will automatically receive a
 * [`rowId`](https://ariakit.org/reference/select-item#rowid) prop.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx {4-11}
 * <SelectProvider>
 *   <Select />
 *   <SelectPopover>
 *     <SelectRow>
 *       <SelectItem value="Apple" />
 *       <SelectItem value="Orange" />
 *     </SelectRow>
 *     <SelectRow>
 *       <SelectItem value="Banana" />
 *       <SelectItem value="Grape" />
 *     </SelectRow>
 *   </SelectPopover>
 * </SelectProvider>
 * ```
 */
export const SelectRow = forwardRef(function SelectRow(props: SelectRowProps) {
  const htmlProps = useSelectRow(props);
  return createElement(TagName, htmlProps);
});

export interface SelectRowOptions<T extends ElementType = TagName>
  extends CompositeRowOptions<T> {
  /**
   * Object returned by the
   * [`useSelectStore`](https://ariakit.org/reference/use-select-store) hook. If
   * not provided, the parent
   * [`SelectList`](https://ariakit.org/reference/select-list) or
   * [`SelectPopover`](https://ariakit.org/reference/select-popover) components'
   * context will be used.
   */
  store?: SelectStore;
}

export type SelectRowProps<T extends ElementType = TagName> = Props<
  T,
  SelectRowOptions<T>
>;
