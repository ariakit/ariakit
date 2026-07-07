import type { ProviderComponent } from "@ariakit/react-utils";
import type { PickRequired } from "@ariakit/utils";
import type { ReactElement, ReactNode } from "react";
import {
  ComboboxContextProvider,
  createComboboxProvider,
} from "./combobox-context.tsx";
import type {
  ComboboxStore,
  ComboboxStoreProps,
  ComboboxStoreSelectedValue,
} from "./combobox-store.ts";
import { useComboboxStore } from "./combobox-store.ts";

type Value = ComboboxStoreSelectedValue;

export interface ComboboxProviderComponent extends ProviderComponent<ComboboxStore> {
  <T extends Value = Value>(
    props: PickRequired<
      ComboboxProviderProps<T>,
      "selectedValue" | "defaultSelectedValue"
    >,
  ): ReactElement;
  (props?: ComboboxProviderProps): ReactElement;
}

/**
 * Provides a combobox store that controls the state of
 * [Combobox](https://ariakit.com/components/combobox) components.
 * @see https://ariakit.com/components/combobox
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
export const ComboboxProvider: ComboboxProviderComponent =
  createComboboxProvider(function ComboboxProvider(
    props: ComboboxProviderProps = {},
  ) {
    const store = useComboboxStore(props);
    return (
      <ComboboxContextProvider value={store}>
        {props.children}
      </ComboboxContextProvider>
    );
  });

export interface ComboboxProviderProps<
  T extends Value = Value,
> extends ComboboxStoreProps<T> {
  children?: ReactNode;
}
