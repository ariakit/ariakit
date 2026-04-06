import { getActiveElement, getWindow } from "@ariakit/core/utils/dom";
import type { CloseWatcherInstance } from "./supports-close-watcher.ts";
import { getCloseWatcher } from "./supports-close-watcher.ts";

// Bridges the CloseWatcher API to the existing keydown-based escape handling.
// A single CloseWatcher is shared across all dialogs in each owner window to
// avoid Chrome's grouping behavior, where watchers created without user
// activation (e.g., tooltips from hover) are grouped together and all close on
// a single Escape press.
//
// When the CloseWatcher fires, a synthetic Escape keydown is dispatched on the
// active element, letting individual dialog keydown handlers process it with
// their usual stacking and target validation logic.

interface CloseWatcherBridgeState {
  window: CloseWatcherBridgeWindow;
  watcher: CloseWatcherInstance | null;
  refCount: number;
}

interface CloseWatcherBridgeWindow extends Window {
  KeyboardEvent: typeof KeyboardEvent;
}

const bridgeStates = new Map<Window, CloseWatcherBridgeState>();

// Tracks synthetic keydown events dispatched by the bridge. Dialog handlers
// use this to distinguish bridge events from real keydown events that the
// browser may also dispatch for the same Escape key press.
const bridgeEvents = new WeakSet<Event>();

// Traverses shadow roots to find the innermost focused element.
// `document.activeElement` stops at the shadow host, so without this
// the synthetic Escape event would never reach handlers inside shadow
// trees (e.g., web component editors embedded in a dialog).
function getDeepActiveElement(window: CloseWatcherBridgeWindow): Element {
  const { document } = window;
  let active: Element | null = getActiveElement(document.body);
  while (active?.shadowRoot?.activeElement) {
    active = active.shadowRoot.activeElement;
  }
  return active || document.body || document.documentElement;
}

function handleClose(state: CloseWatcherBridgeState) {
  const target = getDeepActiveElement(state.window);
  const window = getWindow(target) as CloseWatcherBridgeWindow;
  const event = new window.KeyboardEvent("keydown", {
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
  if (state.refCount > 0) {
    createWatcher(state);
  } else {
    state.watcher = null;
    bridgeStates.delete(state.window);
  }
}

function createWatcher(state: CloseWatcherBridgeState) {
  const CloseWatcher = getCloseWatcher(state.window);
  if (!CloseWatcher) return;
  state.watcher = new CloseWatcher();
  state.watcher.addEventListener("close", () => handleClose(state));
}

function getBridgeState(node?: Window | Document | Node | null) {
  const window = getWindow(node) as CloseWatcherBridgeWindow;
  let state = bridgeStates.get(window);
  if (!state) {
    state = { window, watcher: null, refCount: 0 };
    bridgeStates.set(window, state);
  }
  return state;
}

export function isBridgeEvent(event: Event) {
  return bridgeEvents.has(event);
}

export function acquireCloseWatcherBridge(
  node?: Window | Document | Node | null,
) {
  const state = getBridgeState(node);
  state.refCount++;
  if (state.refCount === 1) {
    createWatcher(state);
  }
}

export function releaseCloseWatcherBridge(
  node?: Window | Document | Node | null,
) {
  const window = getWindow(node);
  const state = bridgeStates.get(window);
  if (!state) return;
  state.refCount--;
  if (state.refCount <= 0) {
    state.refCount = 0;
    state.watcher?.destroy();
    state.watcher = null;
    bridgeStates.delete(window);
  }
}
