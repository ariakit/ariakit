import type { ReactElement, ReactNode } from "react";
import type { PickRequired } from "@ariakit/core/utils/types";
import { ComboboxContextProvider } from "./combobox-context.js";
import { useComboboxStore } from "./combobox-store.js";
import type {
  ComboboxStoreProps,
  ComboboxStoreSelectedValue,
} from "./combobox-store.js";

type Value = ComboboxStoreSelectedValue;

/**
 * Provides a combobox store that controls the state of
 * [Combobox](https://ariakit.org/components/combobox) components.
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx
 * <ComboboxProvider defaultValue="">
 *   <Combobox />
 *   <ComboboxPopover>
 *     <ComboboxItem value="Apple" />
 *     <ComboboxItem value="Banana" />
 *     <ComboboxItem value="Orange" />
 *   </ComboboxPopover>
 * </ComboboxProvider>
 * ```
 */
export function ComboboxProvider<T extends Value = Value>(
  props: PickRequired<
    ComboboxProviderProps<T>,
    "selectedValue" | "defaultSelectedValue"
  >,
): ReactElement;

export function ComboboxProvider(props?: ComboboxProviderProps): ReactElement;

export function ComboboxProvider(props: ComboboxProviderProps = {}) {
  const store = useComboboxStore(props);
  return (
    <ComboboxContextProvider value={store}>
      {props.children}
    </ComboboxContextProvider>
  );
}

export interface ComboboxProviderProps<T extends Value = Value>
  extends ComboboxStoreProps<T> {
  children?: ReactNode;
}
