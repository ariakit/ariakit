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

// Tracks synthetic keydown events dispatched by the bridge. Dialog handlers
// use this to distinguish bridge events from real keydown events that the
// browser may also dispatch for the same Escape key press.
const bridgeEvents = new WeakSet<Event>();

// Traverses shadow roots to find the innermost focused element.
// `document.activeElement` stops at the shadow host, so without this
// the synthetic Escape event would never reach handlers inside shadow
// trees (e.g., web component editors embedded in a dialog).
function getDeepActiveElement(): Element {
  let active = document.activeElement;
  while (active?.shadowRoot?.activeElement) {
    active = active.shadowRoot.activeElement;
  }
  return active || document.body;
}

function handleClose() {
  const target = getDeepActiveElement();
  const event = new KeyboardEvent("keydown", {
    key: "Escape",
    code: "Escape",
    bubbles: true,
    cancelable: true,
    composed: true,
  });
  bridgeEvents.add(event);
  target.dispatchEvent(event);
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

export function isBridgeEvent(event: Event) {
  return bridgeEvents.has(event);
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
