import type { PickRequired } from "@ariakit/core/utils/types";
import type { ReactElement, ReactNode } from "react";
import {
  ComboboxContextProvider,
  registerComboboxProvider,
} from "./combobox-context.tsx";
import type {
  ComboboxStoreProps,
  ComboboxStoreSelectedValue,
} from "./combobox-store.ts";
import { useComboboxStore } from "./combobox-store.ts";

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
interface ComboboxProviderComponent {
  <T extends Value = Value>(
    props: PickRequired<
      ComboboxProviderProps<T>,
      "selectedValue" | "defaultSelectedValue"
    >,
  ): ReactElement;
  (props?: ComboboxProviderProps): ReactElement;
}

export const ComboboxProvider = registerComboboxProvider(
  function ComboboxProvider(props: ComboboxProviderProps = {}) {
    const store = useComboboxStore(props);
    return (
      <ComboboxContextProvider value={store}>
        {props.children}
      </ComboboxContextProvider>
    );
  },
) as ComboboxProviderComponent;

export interface ComboboxProviderProps<
  T extends Value = Value,
> extends ComboboxStoreProps<T> {
  children?: ReactNode;
}
