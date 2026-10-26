import { createStore } from "@ariakit/store";
import type { TooltipStore } from "./tooltip-store.ts";

interface TooltipGlobalState {
  activeStore: TooltipStore | null;
  instantStores: ReadonlySet<TooltipStore>;
}

// A global store that keeps track of the active tooltip store so we can show
// other tooltips without a delay when there's already an active tooltip. It
// also keeps track of the tooltips that show or hide at once because of that,
// so they can render the data-instant attribute.
export const globalStore = createStore<TooltipGlobalState>({
  activeStore: null,
  instantStores: new Set(),
});

/**
 * Sets whether the tooltip store shows or hides at once because of the skip
 * window.
 */
export function setInstant(store: TooltipStore, instant: boolean) {
  globalStore.setState("instantStores", (stores) => {
    if (stores.has(store) === instant) return stores;
    const nextStores = new Set(stores);
    if (instant) {
      nextStores.add(store);
    } else {
      nextStores.delete(store);
    }
    return nextStores;
  });
}
