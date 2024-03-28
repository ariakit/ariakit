import type { ReactNode } from "react";
import { DisclosureContextProvider } from "./disclosure-context.tsx";
import { useDisclosureStore } from "./disclosure-store.ts";
import type { DisclosureStoreProps } from "./disclosure-store.ts";

/**
 * Provides a disclosure store to
 * [Disclosure](https://ariakit.org/components/disclosure) components.
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
