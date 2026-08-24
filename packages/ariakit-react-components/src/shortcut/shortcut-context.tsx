import { unstable_getGlobalShortcutStore } from "@ariakit/components/shortcut/shortcut-store";
import type { UnstableShortcutScope } from "@ariakit/components/shortcut/shortcut-store";
import { createStoreContext } from "@ariakit/react-utils";
import { createContext } from "react";
import { bindReactShortcutStore } from "./__shortcut-store.ts";
import type { ShortcutStore } from "./shortcut-store.ts";

const shortcut = createStoreContext<ShortcutStore>();

let globalStore: ShortcutStore | undefined;

function getGlobalReactStore() {
  if (globalStore) return globalStore;
  globalStore = bindReactShortcutStore(unstable_getGlobalShortcutStore());
  return globalStore;
}

/**
 * Returns the shortcut store from the nearest shortcut provider. Without a
 * provider, this returns the shared global shortcut store.
 */
export function useShortcutContext(): ShortcutStore {
  return shortcut.useContext() ?? getGlobalReactStore();
}

export const useShortcutScopedContext = shortcut.useScopedContext;

export const useShortcutProviderContext = shortcut.useProviderContext;

export const ShortcutContextProvider = shortcut.ContextProvider;

export const ShortcutScopedContextProvider = shortcut.ScopedContextProvider;

/** @private */
export const UnstableShortcutScopeContext = createContext<
  UnstableShortcutScope | null | undefined
>(undefined);

/** @private */
export interface UnstableShortcutCommandContextValue {
  id: object;
  command?: string;
  keys?: string | null;
  enabled: boolean;
  inScope: boolean;
  hasAriaKeyShortcuts: boolean;
  store: ShortcutStore;
}

/** @private */
export const UnstableShortcutCommandContext =
  createContext<UnstableShortcutCommandContextValue | null>(null);
