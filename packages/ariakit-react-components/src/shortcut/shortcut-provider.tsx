import type { ReactNode } from "react";
import { ShortcutContextProvider } from "./shortcut-context.tsx";
import type { ShortcutStoreProps } from "./shortcut-store.ts";
import { useShortcutStore } from "./shortcut-store.ts";

/**
 * Provides a shortcut store to descendant shortcut components and hooks.
 */
export function ShortcutProvider(props: ShortcutProviderProps = {}) {
  const store = useShortcutStore(props);
  return (
    <ShortcutContextProvider value={store}>
      {props.children}
    </ShortcutContextProvider>
  );
}

export interface ShortcutProviderProps extends ShortcutStoreProps {
  children?: ReactNode;
}
