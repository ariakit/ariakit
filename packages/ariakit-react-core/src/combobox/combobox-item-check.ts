import { useContext } from "react";
import type { CheckboxCheckOptions } from "../checkbox/checkbox-check.jsx";
import { useCheckboxCheck } from "../checkbox/checkbox-check.jsx";
import {
  createComponent,
  createElement,
  createHook,
} from "../utils/system.jsx";
import type { As, Props } from "../utils/types.js";
import { ComboboxItemCheckedContext } from "./combobox-context.js";
import type { ComboboxStore } from "./combobox-store.js";

/**
 * Returns props to create a `ComboboxItemCheck` component. This hook must be
 * used in a component that's wrapped with `ComboboxItem` or the `checked` prop
 * must be explicitly passed to the component.
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx
 * const props = useComboboxItemCheck({ checked: true });
 * <Role {...props} />
 * ```
 */
export const useComboboxItemCheck = createHook<ComboboxItemCheckOptions>(
  ({ store, checked, ...props }) => {
    const context = useContext(ComboboxItemCheckedContext);
    checked = checked ?? context;
    props = useCheckboxCheck({ ...props, checked });
    return props;
  },
);

/**
 * Renders a checkmark inside a
 * [`ComboboxItem`](https://ariakit.org/reference/combobox-item) component. This
 * component must be wrapped with
 * [`ComboboxItem`](https://ariakit.org/reference/combobox-item) or the
 * [`checked`](https://ariakit.org/reference/combobox-item-check#checked) prop
 * must be explicitly set.
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx {5,9}
 * <ComboboxProvider>
 *   <Combobox />
 *   <ComboboxPopover>
 *     <ComboboxItem value="Apple">
 *       <ComboboxItemCheck />
 *       Apple
 *     </ComboboxItem>
 *     <ComboboxItem value="Orange">
 *       <ComboboxItemCheck />
 *       Orange
 *     </ComboboxItem>
 *   </ComboboxPopover>
 * </ComboboxProvider>
 * ```
 */
export const ComboboxItemCheck = createComponent<ComboboxItemCheckOptions>(
  (props) => {
    const htmlProps = useComboboxItemCheck(props);
    return createElement("span", htmlProps);
  },
);

if (process.env.NODE_ENV !== "production") {
  ComboboxItemCheck.displayName = "ComboboxItemCheck";
}

export interface ComboboxItemCheckOptions<T extends As = "span">
  extends CheckboxCheckOptions<T> {
  /**
   * Object returned by the
   * [`useComboboxStore`](https://ariakit.org/reference/use-combobox-store)
   * hook. If not provided, the parent
   * [`ComboboxList`](https://ariakit.org/reference/combobox-list) or
   * [`ComboboxPopover`](https://ariakit.org/reference/combobox-popover)
   * components' context will be used.
   */
  store?: ComboboxStore;
  /**
   * Whether the check mark should be shown. This value is automatically
   * inferred from the parent
   * [`ComboboxItem`](https://ariakit.org/reference/combobox-item) component.
   * Manually setting this prop will override the inferred value.
   *
   * Live examples:
   * - [Submenu with
   *   Combobox](https://ariakit.org/examples/menu-nested-combobox)
   */
  checked?: CheckboxCheckOptions<T>["checked"];
}

export type ComboboxItemCheckProps<T extends As = "span"> = Props<
  ComboboxItemCheckOptions<T>
>;
