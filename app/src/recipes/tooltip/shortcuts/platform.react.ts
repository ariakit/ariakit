import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

function getApplePlatform() {
  return /Mac|iPhone|iPad/.test(navigator.platform);
}

/**
 * Whether the browser runs on an Apple platform, where shortcuts use the
 * Command key instead of Control. The server renders the Apple keys, and the
 * browser corrects them after hydration.
 */
export function useApplePlatform() {
  return useSyncExternalStore(subscribe, getApplePlatform, () => true);
}
