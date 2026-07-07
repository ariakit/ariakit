import type { ProviderComponent } from "@ariakit/react-utils";
import type { PickRequired } from "@ariakit/utils";
import type { ReactElement, ReactNode } from "react";
import {
  createSelectProvider,
  SelectContextProvider,
} from "./select-context.tsx";
import type {
  SelectStore,
  SelectStoreProps,
  SelectStoreValue,
} from "./select-store.ts";
import { useSelectStore } from "./select-store.ts";

type Value = SelectStoreValue;

export interface SelectProviderComponent extends ProviderComponent<SelectStore> {
  <T extends Value = Value>(
    props: PickRequired<SelectProviderProps<T>, "value" | "defaultValue">,
  ): ReactElement;
  (props?: SelectProviderProps): ReactElement;
}

/**
 * Provides a select store to [Select](https://ariakit.com/components/select)
 * components.
 * @see https://ariakit.com/components/select
 * @example
 * ```jsx
 * <SelectProvider defaultValue="Apple">
 *   <Select />
 *   <SelectPopover>
 *     <SelectItem value="Apple" />
 *     <SelectItem value="Banana" />
 *     <SelectItem value="Orange" />
 *   </SelectPopover>
 * </SelectProvider>
 * ```
 */
export const SelectProvider: SelectProviderComponent = createSelectProvider(
  function SelectProvider(props: SelectProviderProps = {}) {
    const store = useSelectStore(props);
    return (
      <SelectContextProvider value={store}>
        {props.children}
      </SelectContextProvider>
    );
  },
);

export interface SelectProviderProps<
  T extends Value = Value,
> extends SelectStoreProps<T> {
  children?: ReactNode;
}
