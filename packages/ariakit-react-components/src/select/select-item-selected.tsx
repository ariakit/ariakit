import type { ReactNode } from "react";
import { useContext } from "react";
import { SelectItemCheckedContext } from "./select-context.tsx";

/**
 * Exposes whether the closest
 * [`SelectItem`](https://ariakit.com/reference/select-item) is selected through
 * a function child.
 *
 * As a value component, it doesn't render any DOM elements and therefore
 * doesn't accept HTML props.
 * @deprecated Use
 * [`ComboboxItemSelected`](https://ariakit.com/reference/combobox-item-selected)
 * instead.
 * @see https://ariakit.com/components/select
 * @example
 * ```jsx {5-7}
 * <SelectProvider>
 *   <Select />
 *   <SelectPopover>
 *     <SelectItem value="Apple">
 *       <SelectItemSelected>
 *         {(selected) => (selected ? <CheckIcon /> : null)}
 *       </SelectItemSelected>
 *       Apple
 *     </SelectItem>
 *   </SelectPopover>
 * </SelectProvider>
 * ```
 */
export function SelectItemSelected({ children }: SelectItemSelectedProps) {
  const selected = useContext(SelectItemCheckedContext);
  return children(selected);
}

/** @deprecated Use `ComboboxItemSelectedProps` instead. */
export interface SelectItemSelectedProps {
  /**
   * A function that gets called with the closest
   * [`SelectItem`](https://ariakit.com/reference/select-item) component's
   * selected state.
   */
  children: (selected: boolean) => ReactNode;
}
