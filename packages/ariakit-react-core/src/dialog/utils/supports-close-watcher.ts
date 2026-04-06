import { getWindow } from "@ariakit/core/utils/dom";

interface CloseWatcherConstructor {
  new (): CloseWatcherInstance;
  prototype: CloseWatcherInstance;
}

interface CloseWatcherWindow extends Window {
  CloseWatcher?: CloseWatcherConstructor;
}

// CloseWatcher is not yet in TypeScript's DOM lib types.
declare global {
  var CloseWatcher: CloseWatcherConstructor | undefined;
}

interface CloseWatcherInstance extends EventTarget {
  oncancel: ((this: CloseWatcherInstance, ev: Event) => void) | null;
  onclose: ((this: CloseWatcherInstance, ev: Event) => void) | null;
  close(): void;
  destroy(): void;
  requestClose(): void;
}

export type { CloseWatcherInstance };

export function getCloseWatcher(node?: Window | Document | Node | null) {
  if (!node) {
    return typeof CloseWatcher === "function" ? CloseWatcher : null;
  }
  const window = getWindow(node) as CloseWatcherWindow;
  return typeof window.CloseWatcher === "function" ? window.CloseWatcher : null;
}

export function supportsCloseWatcher(node?: Window | Document | Node | null) {
  return !!getCloseWatcher(node);
}
