import { useStoreState } from "@ariakit/react-store";
import { invariant } from "@ariakit/utils";
import type { ReactNode } from "react";
import { useComboboxContext } from "./combobox-context.tsx";
import type { ComboboxStore, ComboboxStoreState } from "./combobox-store.ts";

/**
 * Renders the current
 * [`inputValue`](https://ariakit.com/reference/use-combobox-store#inputvalue)
 * state in the
 * [combobox store](https://ariakit.com/reference/use-combobox-store).
 *
 * As a value component, it doesn't render any DOM elements and therefore
 * doesn't accept HTML props.
 *
 * It takes a
 * [`children`](https://ariakit.com/reference/combobox-input-value#children)
 * function that gets called with the current input value as an argument. This
 * can be used as an uncontrolled API to render the combobox input value in a
 * custom way.
 * @see https://ariakit.com/components/combobox
 * @example
 * ```jsx {3-5}
 * <ComboboxProvider>
 *   <Combobox />
 *   <ComboboxInputValue>
 *     {(value) => `Current input value: ${value}`}
 *   </ComboboxInputValue>
 * </ComboboxProvider>
 * ```
 */
export function ComboboxInputValue({
  store,
  children,
}: ComboboxInputValueProps = {}) {
  const context = useComboboxContext();
  store = store || context;

  invariant(
    store,
    process.env.NODE_ENV !== "production" &&
      "ComboboxInputValue must receive a `store` prop or be wrapped in a ComboboxProvider component.",
  );

  const inputValue = useStoreState(store, "inputValue");

  if (children) {
    return children(inputValue);
  }

  return inputValue;
}

export interface ComboboxInputValueProps {
  /**
   * Object returned by the
   * [`useComboboxStore`](https://ariakit.com/reference/use-combobox-store)
   * hook. If not provided, the closest
   * [`ComboboxProvider`](https://ariakit.com/reference/combobox-provider)
   * component's context will be used.
   */
  store?: ComboboxStore;
  /**
   * A function that gets called with the current input value as an argument. It
   * can be used to render the combobox input value in a custom way.
   */
  children?: (value: ComboboxStoreState["inputValue"]) => ReactNode;
}
