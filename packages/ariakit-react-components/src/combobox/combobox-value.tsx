import type { ComboboxInputValueProps } from "./combobox-input-value.tsx";
import { ComboboxInputValue } from "./combobox-input-value.tsx";

/**
 * Renders the current
 * [`value`](https://ariakit.com/reference/use-combobox-store#value) state in
 * the [combobox store](https://ariakit.com/reference/use-combobox-store).
 *
 * As a value component, it doesn't render any DOM elements and therefore
 * doesn't accept HTML props.
 *
 * It takes a
 * [`children`](https://ariakit.com/reference/combobox-value#children) function
 * that gets called with the current value as an argument. This can be used as
 * an uncontrolled API to render the combobox value in a custom way.
 * @deprecated Use
 * [`ComboboxInputValue`](https://ariakit.com/reference/combobox-input-value)
 * instead.
 * @see https://ariakit.com/components/combobox
 * @example
 * ```jsx {3-5}
 * <ComboboxProvider>
 *   <Combobox />
 *   <ComboboxValue>
 *     {(value) => `Current value: ${value}`}
 *   </ComboboxValue>
 * </ComboboxProvider>
 * ```
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
