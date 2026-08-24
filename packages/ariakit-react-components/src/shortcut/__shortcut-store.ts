import type * as Core from "@ariakit/components/shortcut/shortcut-store";
import { useStoreState } from "@ariakit/react-store";
import type { Store } from "@ariakit/react-store";
import { useSafeLayoutEffect } from "@ariakit/react-utils";
import { useCallback, useState } from "react";
import { useSyncExternalStore } from "use-sync-external-store/shim";

type ShortcutStoreStateSelector =
  | keyof Core.ShortcutStoreState
  | ((state: Core.ShortcutStoreState) => unknown);

const shortcutStoreStateKeys = [
  "enabled",
  "platform",
  "glyphs",
  "keyNames",
  "keys",
] as const;

type ShortcutScopeValue =
  | Core.ShortcutScopeRef
  | Core.ShortcutScopeRef[]
  | null
  | undefined;

export function useShortcutRegistryVersion(store: Core.ShortcutStore) {
  const subscribe = useCallback(
    (listener: () => void) => store.unstable_subscribeRegistry(listener),
    [store],
  );
  const getSnapshot = useCallback(
    () => store.unstable_getRegistryVersion(),
    [store],
  );
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function useShortcutPlatform(
  store: Core.ShortcutStore,
  platformProp?: Core.ShortcutPlatform,
) {
  const storePlatform = useShortcutStoreStateValue(store, "platform");
  let current: Core.ShortcutStore | undefined = store.unstable_getStore();
  let hasExplicitPlatform = false;
  while (current) {
    if (current.unstable_hasExplicitPlatform) {
      hasExplicitPlatform = true;
      break;
    }
    current = current.unstable_parent?.unstable_getStore();
  }
  const explicit = platformProp !== undefined || hasExplicitPlatform;
  const [mounted, setMounted] = useState(false);

  useSafeLayoutEffect(() => {
    setMounted(true);
  }, [store]);

  if (!explicit && !mounted) return;
  return platformProp ?? storePlatform;
}

function hasSameShortcutScope(
  scope: ShortcutScopeValue,
  otherScope: ShortcutScopeValue,
) {
  if (Object.is(scope, otherScope)) return true;
  if (!Array.isArray(scope) || !Array.isArray(otherScope)) return false;
  if (scope.length !== otherScope.length) return false;
  for (let index = 0; index < scope.length; index += 1) {
    if (Object.is(scope[index], otherScope[index])) continue;
    return false;
  }
  return true;
}

export function useStableShortcutScope(scope: ShortcutScopeValue) {
  const [stableScope, setStableScope] = useState<ShortcutScopeValue>(() =>
    Array.isArray(scope) ? [...scope] : scope,
  );
  if (hasSameShortcutScope(scope, stableScope)) return stableScope;
  const nextScope = Array.isArray(scope) ? [...scope] : scope;
  setStableScope(nextScope);
  return nextScope;
}

export function useShortcutStoreStateValue(
  store: Core.ShortcutStore,
): Core.ShortcutStoreState;

export function useShortcutStoreStateValue<
  K extends keyof Core.ShortcutStoreState,
>(store: Core.ShortcutStore, key: K): Core.ShortcutStoreState[K];

export function useShortcutStoreStateValue<V>(
  store: Core.ShortcutStore,
  selector: (state: Core.ShortcutStoreState) => V,
): V;

export function useShortcutStoreStateValue(
  store: Core.ShortcutStore,
  keyOrSelector?: ShortcutStoreStateSelector,
): unknown;

export function useShortcutStoreStateValue(
  store: Core.ShortcutStore,
  keyOrSelector?: ShortcutStoreStateSelector,
) {
  const keys =
    typeof keyOrSelector === "string"
      ? [keyOrSelector]
      : shortcutStoreStateKeys;
  return useStoreState(store, keys, (state) => {
    if (typeof keyOrSelector === "function") {
      return keyOrSelector(state);
    }
    if (keyOrSelector === undefined) return state;
    return state[keyOrSelector];
  });
}

export function bindReactShortcutStore(store: Core.ShortcutStore) {
  const useState = function useState(
    keyOrSelector?: ShortcutStoreStateSelector,
  ) {
    return useShortcutStoreStateValue(store, keyOrSelector);
  } as Store<Core.ShortcutStore>["useState"];
  return { ...store, useState };
}
