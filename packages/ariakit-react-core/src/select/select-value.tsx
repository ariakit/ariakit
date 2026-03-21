import type { PickRequired, ToPrimitive } from "@ariakit/core/utils/types";
import type { ReactNode } from "react";
import { useStoreState } from "../utils/store.tsx";
import type { StoreProp } from "../utils/system.tsx";
import { useSelectContextStore } from "./select-context.tsx";
import type { SelectStore, SelectStoreValue } from "./select-store.ts";

type Value = SelectStoreValue;

/**
 * Renders the current
 * [`value`](https://ariakit.org/reference/use-select-store#value) state in the
 * [select store](https://ariakit.org/reference/use-select-store).
 *
 * As a value component, it doesn't render any DOM elements and therefore
 * doesn't accept HTML props. It can optionally accept a
 * [`fallback`](https://ariakit.org/reference/select-value#fallback) prop to use
 * as a default value if the store's
 * [`value`](https://ariakit.org/reference/use-select-store#value) is
 * `undefined`.
 *
 * Additionally, it takes a
 * [`children`](https://ariakit.org/reference/select-value#children) function
 * that gets called with the current value as an argument. This is handy for
 * rendering the value in a custom way.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx {3}
 * <SelectProvider>
 *   <Select>
 *     <SelectValue fallback="Select a value" />
 *     <SelectArrow />
 *   </Select>
 *   <SelectPopover>
 *     <SelectItem value="Apple" />
 *     <SelectItem value="Banana" />
 *     <SelectItem value="Orange" />
 *   </SelectPopover>
 * </SelectProvider>
 * ```
 * @example
 * ```jsx {1-3,7}
 * function renderValue(value) {
 *   // render custom JSX
 * }
 *
 * <SelectProvider>
 *   <Select>
 *     <SelectValue>{renderValue}</SelectValue>
 *     <SelectArrow />
 *   </Select>
 *   <SelectPopover>
 *     <SelectItem value="Apple" />
 *     <SelectItem value="Banana" />
 *     <SelectItem value="Orange" />
 *   </SelectPopover>
 * </SelectProvider>
 * ```
 */

export function SelectValue<T extends Value = Value>(
  props: PickRequired<SelectValueProps<T>, "fallback">,
): T;

export function SelectValue(props?: SelectValueProps): Value;

export function SelectValue({
  store,
  fallback,
  children,
}: SelectValueProps = {}) {
  store = useSelectContextStore(store, "SelectValue");

  const value = useStoreState(store, (state) => {
    if (!state?.value.length) return fallback;
    return state.value;
  });

  if (children) {
    return children(value || "");
  }

  return value;
}

export interface SelectValueProps<T extends Value = Value> {
  /**
   * Object returned by the
   * [`useSelectStore`](https://ariakit.org/reference/use-select-store) hook.
   * This prop can also receive the corresponding
   * [`SelectProvider`](https://ariakit.org/reference/select-provider)
   * component, which makes the component read the store from that provider's
   * context explicitly, or `null`, which disables context lookup.
   * If not provided, the closest
   * [`SelectProvider`](https://ariakit.org/reference/select-provider)
   * component's context will be used.
   */
  store?: StoreProp<SelectStore<T>>;
  /**
   * The value to use as a default if the store's
   * [`value`](https://ariakit.org/reference/use-select-store#value) is
   * `undefined`.
   * @default ""
   */
  fallback?: T;
  /**
   * A function that gets called with the current value as an argument. This is
   * handy for rendering the value in a custom way.
   */
  children?: (value: ToPrimitive<T>) => ReactNode;
}
