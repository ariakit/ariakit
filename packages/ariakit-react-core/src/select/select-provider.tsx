import type { PickRequired } from "@ariakit/core/utils/types";
import type { ReactElement, ReactNode } from "react";
import { SelectContextProvider } from "./select-context.tsx";
import type { SelectStoreProps, SelectStoreValue } from "./select-store.ts";
import { useSelectStore } from "./select-store.ts";

type Value = SelectStoreValue;

/**
 * Provides a select store to [Select](https://ariakit.org/components/select)
 * components.
 * @see https://ariakit.org/components/select
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

export function SelectProvider<T extends Value = Value>(
  props: PickRequired<SelectProviderProps<T>, "value" | "defaultValue">,
): ReactElement;

export function SelectProvider(props?: SelectProviderProps): ReactElement;

export function SelectProvider(props: SelectProviderProps = {}) {
  const store = useSelectStore(props);
  return (
    <SelectContextProvider value={store}>
      {props.children}
    </SelectContextProvider>
  );
}

export interface SelectProviderProps<T extends Value = Value>
  extends SelectStoreProps<T> {
  children?: ReactNode;
}
