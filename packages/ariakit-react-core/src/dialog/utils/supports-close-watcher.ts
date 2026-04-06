// CloseWatcher is not yet in TypeScript's DOM lib types.
declare global {
  // biome-ignore lint/style/noVar: global ambient declarations require var
  var CloseWatcher:
    | {
        new (): CloseWatcherInstance;
        prototype: CloseWatcherInstance;
      }
    | undefined;
}

interface CloseWatcherInstance extends EventTarget {
  oncancel: ((this: CloseWatcherInstance, ev: Event) => void) | null;
  onclose: ((this: CloseWatcherInstance, ev: Event) => void) | null;
  close(): void;
  destroy(): void;
  requestClose(): void;
}

export type { CloseWatcherInstance };

export function supportsCloseWatcher() {
  // Debug
  // return false;
  return typeof CloseWatcher === "function";
}
