import type { ReactNode } from "react";
import { DisclosureContextProvider } from "./disclosure-context.js";
import { useDisclosureStore } from "./disclosure-store.js";
import type { DisclosureStoreProps } from "./disclosure-store.js";

/**
 * Provides a disclosure store to Disclosure components.
 * @see https://ariakit.org/components/disclosure
 * @example
 * ```jsx
 * <DisclosureProvider>
 *   <Disclosure />
 *   <DisclosureContent />
 * </DisclosureProvider>
 * ```
 */
export function DisclosureProvider(props: DisclosureProviderProps = {}) {
  const store = useDisclosureStore(props);
  return (
    <DisclosureContextProvider value={store}>
      {props.children}
    </DisclosureContextProvider>
  );
}

export interface DisclosureProviderProps extends DisclosureStoreProps {
  children?: ReactNode;
}
