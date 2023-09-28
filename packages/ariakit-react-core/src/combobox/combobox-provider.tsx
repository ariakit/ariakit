import type { ReactNode } from "react";
import { ComboboxContextProvider } from "./combobox-context.js";
import { useComboboxStore } from "./combobox-store.js";
import type { ComboboxStoreProps } from "./combobox-store.js";

/**
 * Provides a combobox store to Combobox components.
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
export function ComboboxProvider(props: ComboboxProviderProps = {}) {
  const store = useComboboxStore(props);
  return (
    <ComboboxContextProvider value={store}>
      {props.children}
    </ComboboxContextProvider>
  );
}

export interface ComboboxProviderProps extends ComboboxStoreProps {
  children?: ReactNode;
}
