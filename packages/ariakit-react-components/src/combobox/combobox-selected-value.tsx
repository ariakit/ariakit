import { useStoreState } from "@ariakit/react-store";
import { invariant } from "@ariakit/utils";
import type { PickRequired, ToPrimitive } from "@ariakit/utils";
import type { ReactNode } from "react";
import { useComboboxContext } from "./combobox-context.tsx";
import type {
  ComboboxStore,
  ComboboxStoreSelectedValue,
} from "./combobox-store.ts";

type Value = ComboboxStoreSelectedValue;

/**
 * Renders the current
 * [`selectedValue`](https://ariakit.com/reference/use-combobox-store#selectedvalue)
 * state in the combobox store.
 *
 * As a value component, it doesn't render any DOM elements and therefore
 * doesn't accept HTML props. It can receive a `fallback` value or a function
 * child to customize how the value is rendered.
 * @example
 * ```jsx {3}
 * <ComboboxProvider>
 *   <ComboboxSelect>
 *     <ComboboxSelectedValue fallback="Select a fruit" />
 *   </ComboboxSelect>
 *   <ComboboxPopover>
 *     <ComboboxItem value="Apple" />
 *     <ComboboxItem value="Orange" />
 *   </ComboboxPopover>
 * </ComboboxProvider>
 * ```
 * @see https://ariakit.com/components/combobox
 */
export function ComboboxSelectedValue<T extends Value = Value>(
  props: PickRequired<ComboboxSelectedValueProps<T>, "fallback">,
): T;

export function ComboboxSelectedValue(
  props?: ComboboxSelectedValueProps,
): Value;

export function ComboboxSelectedValue({
  store,
  fallback,
  children,
}: ComboboxSelectedValueProps = {}) {
  const context = useComboboxContext();
  store = store || context;

  invariant(
    store,
    process.env.NODE_ENV !== "production" &&
      "ComboboxSelectedValue must receive a `store` prop or be wrapped in a ComboboxProvider component.",
  );

  const selectedValue = useStoreState(store, ["selectedValue"], (state) => {
    if (!state.selectedValue.length) return fallback;
    return state.selectedValue;
  });

  if (children) {
    return children(selectedValue || "");
  }

  return selectedValue;
}

export interface ComboboxSelectedValueProps<T extends Value = Value> {
  /**
   * Object returned by the
   * [`useComboboxStore`](https://ariakit.com/reference/use-combobox-store)
   * hook.
   */
  store?: ComboboxStore<T>;
  /**
   * The value to use if the store's `selectedValue` state is empty.
   * @default ""
   */
  fallback?: T;
  /**
   * A function that gets called with the current selected value.
   */
  children?: (value: ToPrimitive<T>) => ReactNode;
}
