import type { ElementType } from "react";
import type { ComboboxOptions, ComboboxProps } from "./combobox.tsx";
import { Combobox, useCombobox } from "./combobox.tsx";

const TagName = "input" satisfies ElementType;
type TagName = typeof TagName;

/**
 * Returns props to create a `ComboboxInput` component.
 * @see https://ariakit.com/components/combobox
 */
export const useComboboxInput = useCombobox;

/**
 * **Alias**: [`Combobox`](https://ariakit.com/reference/combobox)
 *
 * Renders a combobox input element that can be used to filter a list of items.
 *
 * When rendered inside a
 * [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover) with
 * [`ComboboxSelect`](https://ariakit.com/reference/combobox-select), it turns
 * the select into a filterable select and receives focus when the popover opens.
 * @see https://ariakit.com/components/combobox
 * @example
 * ```jsx {4}
 * <ComboboxProvider>
 *   <ComboboxSelect />
 *   <ComboboxPopover>
 *     <ComboboxInput />
 *     <ComboboxList>
 *       <ComboboxItem value="Apple" />
 *     </ComboboxList>
 *   </ComboboxPopover>
 * </ComboboxProvider>
 * ```
 */
export const ComboboxInput = Combobox;

export interface ComboboxInputOptions<
  T extends ElementType = TagName,
> extends ComboboxOptions<T> {}

export type ComboboxInputProps<T extends ElementType = TagName> =
  ComboboxProps<T>;
