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
 * Renders a checkmark icon when the
 * [`checked`](https://ariakit.org/reference/combobox-item-check#checked) prop
 * is `true`. The icon can be overridden by providing a different one as
 * children.
 *
 * When rendered inside a
 * [`ComboboxItem`](https://ariakit.org/reference/combobox-item) component, the
 * [`checked`](https://ariakit.org/reference/combobox-item-check#checked) prop
 * is automatically derived from the context.
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
   * hook.
   */
  store?: ComboboxStore;
}

export type ComboboxItemCheckProps<T extends As = "span"> = Props<
  ComboboxItemCheckOptions<T>
>;
