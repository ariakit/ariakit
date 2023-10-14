import type { ReactNode } from "react";
import { RadioContextProvider } from "./radio-context.js";
import { useRadioStore } from "./radio-store.js";
import type { RadioStoreProps } from "./radio-store.js";

/**
 * Provides a radio store to Radio components.
 * @see https://ariakit.org/components/radio
 * @example
 * ```jsx
 * <RadioProvider defaultValue="Apple">
 *   <RadioGroup>
 *     <Radio value="Apple" />
 *     <Radio value="Orange" />
 *   </RadioGroup>
 * </RadioProvider>
 * ```
 */
export function RadioProvider(props: RadioProviderProps = {}) {
  const store = useRadioStore(props);
  return (
    <RadioContextProvider value={store}>{props.children}</RadioContextProvider>
  );
}

export interface RadioProviderProps extends RadioStoreProps {
  children?: ReactNode;
}
