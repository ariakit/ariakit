import { invariant } from "@ariakit/core/utils/misc";
import type { ReactNode } from "react";
import { useComboboxContext } from "./combobox-context.tsx";
import type { ComboboxStore, ComboboxStoreState } from "./combobox-store.ts";

/**
 * Renders the current
 * [`value`](https://ariakit.org/reference/use-combobox-store#value) state in
 * the [combobox store](https://ariakit.org/reference/use-combobox-store).
 *
 * As a value component, it doesn't render any DOM elements and therefore
 * doesn't accept HTML props.
 *
 * It takes a
 * [`children`](https://ariakit.org/reference/combobox-value#children) function
 * that gets called with the current value as an argument. This can be used as
 * an uncontrolled API to render the combobox value in a custom way.
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx {3-5}
 * <ComboboxProvider>
 *   <Combobox />
 *   <ComboboxValue>
 *     {(value) => `Current value: ${value}`}
 *   </ComboboxValue>
 * </ComboboxProvider>
 * ```
 */
export function ComboboxValue({ store, children }: ComboboxValueProps = {}) {
  const context = useComboboxContext();
  store = store || context;

  invariant(
    store,
    process.env.NODE_ENV !== "production" &&
      "ComboboxValue must receive a `store` prop or be wrapped in a ComboboxProvider component.",
  );

  const value = store.useState("value");

  if (children) {
    return children(value);
  }

  return value;
}

export interface ComboboxValueProps {
  /**
   * Object returned by the
   * [`useComboboxStore`](https://ariakit.org/reference/use-combobox-store)
   * hook. If not provided, the closest
   * [`ComboboxProvider`](https://ariakit.org/reference/combobox-provider)
   * component's context will be used.
   */
  store?: ComboboxStore;
  /**
   * A function that gets called with the current value as an argument. It can
   * be used to render the combobox value in a custom way.
   */
  children?: (value: ComboboxStoreState["value"]) => ReactNode;
}
