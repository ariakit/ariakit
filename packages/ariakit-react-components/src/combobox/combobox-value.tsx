import type { ComboboxInputValueProps } from "./combobox-input-value.tsx";
import { ComboboxInputValue } from "./combobox-input-value.tsx";

/**
 * @deprecated Use
 * [`ComboboxInputValue`](https://ariakit.com/reference/combobox-input-value)
 * instead.
 */
export function ComboboxValue(props: ComboboxValueProps = {}) {
  return <ComboboxInputValue {...props} />;
}

/**
 * @deprecated Use
 * [`ComboboxInputValueProps`](https://ariakit.com/reference/combobox-input-value)
 * instead.
 */
export interface ComboboxValueProps extends ComboboxInputValueProps {}
