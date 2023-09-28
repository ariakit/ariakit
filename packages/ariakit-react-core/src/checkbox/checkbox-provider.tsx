import type { ReactElement, ReactNode } from "react";
import type { PickRequired } from "@ariakit/core/utils/types";
import { CheckboxContextProvider } from "./checkbox-context.js";
import { useCheckboxStore } from "./checkbox-store.js";
import type {
  CheckboxStoreProps,
  CheckboxStoreValue,
} from "./checkbox-store.js";

type Value = CheckboxStoreValue;

/**
 * Provides a checkbox store to its descendants. This is useful to create a
 * group of checkboxes that share the same store.
 * @see https://ariakit.org/components/checkbox
 * @example
 * ```jsx
 * <CheckboxProvider defaultValue={["orange"]}>
 *   <label>
 *     <Checkbox value="apple" /> Apple
 *   </label>
 *   <label>
 *     <Checkbox value="orange" /> Orange
 *   </label>
 *   <label>
 *     <Checkbox value="mango" /> Mango
 *   </label>
 * </CheckboxProvider>
 * ```
 */

export function CheckboxProvider<T extends Value = Value>(
  props: PickRequired<CheckboxProviderProps<T>, "value" | "defaultValue">,
): ReactElement;

export function CheckboxProvider(props?: CheckboxProviderProps): ReactElement;

export function CheckboxProvider(props: CheckboxProviderProps = {}) {
  const store = useCheckboxStore(props);
  return (
    <CheckboxContextProvider value={store}>
      {props.children}
    </CheckboxContextProvider>
  );
}

export interface CheckboxProviderProps<T extends Value = Value>
  extends CheckboxStoreProps<T> {
  children?: ReactNode;
}
