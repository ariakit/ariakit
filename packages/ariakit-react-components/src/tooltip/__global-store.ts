import { createStore } from "@ariakit/store";
import type { TooltipStore } from "./tooltip-store.ts";

interface TooltipGlobalState {
  activeStore: TooltipStore | null;
  instantVersion: number;
}

// A global store that keeps track of the active tooltip store so we can show
// other tooltips without a delay when there's already an active tooltip. Its
// instantVersion changes whenever instantStores does, so tooltips can render
// the data-instant attribute.
export const globalStore = createStore<TooltipGlobalState>({
  activeStore: null,
  instantVersion: 0,
});

// The tooltip stores that show or hide at once because of the skip window. A
// weak set doesn't keep stores whose anchors and tooltips have all unmounted.
const instantStores = new WeakSet<TooltipStore>();

// The tooltip stores that are hiding because another tooltip replaces them.
export const hidingStores = new WeakSet<TooltipStore>();

/**
 * Returns whether the tooltip store shows or hides at once because of the skip
 * window.
 */
export function isInstant(store: TooltipStore) {
  return instantStores.has(store);
}

/**
 * Sets whether the tooltip store shows or hides at once because of the skip
 * window.
 */
export function setInstant(store: TooltipStore, instant: boolean) {
  if (instantStores.has(store) === instant) return;
  if (instant) {
    instantStores.add(store);
  } else {
    instantStores.delete(store);
  }
  globalStore.setState("instantVersion", (version) => version + 1);
}
