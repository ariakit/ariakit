import type { ReactNode } from "react";
import { useContext } from "react";
import { ComboboxItemCheckedContext } from "./combobox-context.tsx";

/**
 * Exposes whether the closest
 * [`ComboboxItem`](https://ariakit.com/reference/combobox-item) is selected
 * through a function child.
 *
 * As a value component, it doesn't render any DOM elements and therefore
 * doesn't accept HTML props.
 * @see https://ariakit.com/components/combobox
 * @example
 * ```jsx
 * <ComboboxItem value="Apple">
 *   <ComboboxItemSelected>
 *     {(selected) => (selected ? <CheckIcon /> : null)}
 *   </ComboboxItemSelected>
 *   Apple
 * </ComboboxItem>
 * ```
 */
export function ComboboxItemSelected({ children }: ComboboxItemSelectedProps) {
  const selected = useContext(ComboboxItemCheckedContext);
  return children(selected);
}

export interface ComboboxItemSelectedProps {
  /**
   * A function that gets called with the closest
   * [`ComboboxItem`](https://ariakit.com/reference/combobox-item) component's
   * selected state.
   */
  children: (selected: boolean) => ReactNode;
}
