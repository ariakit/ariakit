import type { ReactNode } from "react";
import { PopoverContextProvider } from "./popover-context.js";
import { usePopoverStore } from "./popover-store.js";
import type { PopoverStoreProps } from "./popover-store.js";

/**
 * Provides a popover store to [Popover](https://ariakit.org/components/popover)
 * components.
 * @see https://ariakit.org/components/popover
 * @example
 * ```jsx
 * <PopoverProvider>
 *   <PopoverDisclosure />
 *   <Popover />
 * </PopoverProvider>
 * ```
 */
export function PopoverProvider(props: PopoverProviderProps = {}) {
  const store = usePopoverStore(props);
  return (
    <PopoverContextProvider value={store}>
      {props.children}
    </PopoverContextProvider>
  );
}

export interface PopoverProviderProps extends PopoverStoreProps {
  children?: ReactNode;
}
