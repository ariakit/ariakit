import type { CloseWatcherInstance } from "./supports-close-watcher.ts";

// Bridges the CloseWatcher API to the existing keydown-based escape handling.
// A single CloseWatcher is shared across all dialogs to avoid Chrome's grouping
// behavior, where watchers created without user activation (e.g., tooltips from
// hover) are grouped together and all close on a single Escape press.
//
// When the CloseWatcher fires, a synthetic Escape keydown is dispatched on the
// active element, letting individual dialog keydown handlers process it with
// their usual stacking and target validation logic.

let watcher: CloseWatcherInstance | null = null;
let refCount = 0;

function handleClose() {
  const target = document.activeElement || document.body;
  target.dispatchEvent(
    new KeyboardEvent("keydown", {
      key: "Escape",
      bubbles: true,
      cancelable: true,
    }),
  );
  // The watcher is destroyed after the close event fires. Recreate it if
  // there are still mounted dialogs.
  if (refCount > 0) {
    createWatcher();
  } else {
    watcher = null;
  }
}

function createWatcher() {
  watcher = new CloseWatcher!();
  watcher.addEventListener("close", handleClose);
}

export function acquireCloseWatcherBridge() {
  refCount++;
  if (refCount === 1) {
    createWatcher();
  }
}

export function releaseCloseWatcherBridge() {
  refCount--;
  if (refCount <= 0) {
    refCount = 0;
    watcher?.destroy();
    watcher = null;
  }
}
