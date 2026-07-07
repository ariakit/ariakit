import type { ProviderComponent } from "@ariakit/react-utils";
import type { PickRequired } from "@ariakit/utils";
import type { ReactElement, ReactNode } from "react";
import {
  CheckboxContextProvider,
  createCheckboxProvider,
} from "./checkbox-context.tsx";
import type {
  CheckboxStore,
  CheckboxStoreProps,
  CheckboxStoreValue,
} from "./checkbox-store.ts";
import { useCheckboxStore } from "./checkbox-store.ts";

type Value = CheckboxStoreValue;

export interface CheckboxProviderComponent extends ProviderComponent<CheckboxStore> {
  <T extends Value = Value>(
    props: PickRequired<CheckboxProviderProps<T>, "value" | "defaultValue">,
  ): ReactElement;
  (props?: CheckboxProviderProps): ReactElement;
}

/**
 * Provides a checkbox store for its descendants. This comes in handy when
 * creating a group of checkboxes that share the same state. `CheckboxProvider`
 * can efficiently manage the value of a checkbox, whether it's a single string,
 * number, or boolean value, or an array of such values.
 * @see https://ariakit.com/components/checkbox
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
export const CheckboxProvider: CheckboxProviderComponent =
  createCheckboxProvider(function CheckboxProvider(
    props: CheckboxProviderProps = {},
  ) {
    const store = useCheckboxStore(props);
    return (
      <CheckboxContextProvider value={store}>
        {props.children}
      </CheckboxContextProvider>
    );
  });

export interface CheckboxProviderProps<
  T extends Value = Value,
> extends CheckboxStoreProps<T> {
  children?: ReactNode;
}
