import { afterTimeout } from "./after-timeout.js";

export function whenIdle(callback: () => void, timeout?: number) {
  if (!window.requestIdleCallback) {
    return afterTimeout(timeout || 250, callback);
  }
  const id = requestIdleCallback(callback, { timeout });
  return () => cancelIdleCallback(id);
}
