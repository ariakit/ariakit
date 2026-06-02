// oxlint-disable unbound-method
import { isFocusable, noop } from "@ariakit/utils";

export type DirtiableElement = Element & { dirty?: boolean };

export type TextField = HTMLInputElement | HTMLTextAreaElement;

export const isBrowser =
  typeof navigator !== "undefined" &&
  !navigator.userAgent.includes("jsdom") &&
  typeof window !== "undefined" &&
  !("happyDOM" in window);

export async function flushMicrotasks() {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
}

export function nextFrame() {
  return new Promise(requestAnimationFrame);
}

// In jsdom/happy-dom, requestAnimationFrame fires on a ~16ms cadence. Because
// simulated interactions (and the components they drive) wait for several frames
// per action, that cadence dominates test time. We replace it with an immediate
// macrotask so frames resolve at wall-clock speed. Callbacks scheduled before a
// tick are still flushed together, in order, with a shared timestamp, so the
// frame count and ordering that components rely on (e.g. afterPaint's nested
// frames) are preserved — only the wall-clock duration is removed. The browser
// path keeps the native rAF so real timing and painting are unaffected.
if (!isBrowser) {
  let nextRafId = 1;
  let pendingRafs = new Map<number, FrameRequestCallback>();
  let flushingRafs: Map<number, FrameRequestCallback> | null = null;
  let rafScheduled = false;

  globalThis.requestAnimationFrame = ((callback: FrameRequestCallback) => {
    const id = nextRafId++;
    pendingRafs.set(id, callback);
    if (!rafScheduled) {
      rafScheduled = true;
      setTimeout(() => {
        rafScheduled = false;
        // Swap the queue so callbacks scheduled during the flush run on the
        // next frame. Iterating the live map lets a callback cancel a sibling
        // that hasn't run yet, matching the native behavior.
        const frame = pendingRafs;
        pendingRafs = new Map();
        flushingRafs = frame;
        const time = performance.now();
        for (const frameCallback of frame.values()) {
          frameCallback(time);
        }
        flushingRafs = null;
      });
    }
    return id;
  }) as typeof requestAnimationFrame;

  globalThis.cancelAnimationFrame = ((id: number) => {
    pendingRafs.delete(id);
    flushingRafs?.delete(id);
  }) as typeof cancelAnimationFrame;
}

export function setActEnvironment(value: boolean) {
  const scope = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean };
  const previousValue = scope.IS_REACT_ACT_ENVIRONMENT;
  scope.IS_REACT_ACT_ENVIRONMENT = value;
  const restoreActEnvironment = () => {
    scope.IS_REACT_ACT_ENVIRONMENT = previousValue;
  };
  return restoreActEnvironment;
}

export function applyBrowserPolyfills() {
  if (isBrowser) return noop;

  const originalFocus = HTMLElement.prototype.focus;

  HTMLElement.prototype.focus = function focus(options) {
    if (!isFocusable(this)) return;
    return originalFocus.call(this, options);
  };

  const originalGetClientRects = Element.prototype.getClientRects;

  // @ts-expect-error
  Element.prototype.getClientRects = function getClientRects() {
    const isHidden = (element: Element) => {
      if (!element.isConnected) return true;
      if (element.parentElement && isHidden(element.parentElement)) return true;
      if (!(element instanceof HTMLElement)) return false;
      if (element.hidden) return true;
      const style = getComputedStyle(element);
      return style.display === "none" || style.visibility === "hidden";
    };
    if (isHidden(this)) return [];
    return [{ width: 1, height: 1 }];
  };

  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = noop;
  }

  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = noop;
  }

  if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = noop;
  }

  if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = noop;
  }

  if (typeof window.ClipboardEvent === "undefined") {
    // @ts-expect-error
    window.ClipboardEvent = class ClipboardEvent extends Event {};
  }

  if (typeof window.PointerEvent === "undefined") {
    // @ts-expect-error
    window.PointerEvent = class PointerEvent extends MouseEvent {};
  }

  return () => {
    HTMLElement.prototype.focus = originalFocus;
    Element.prototype.getClientRects = originalGetClientRects;
  };
}

let wrapAsyncDepth = 0;
let restoreCurrentWrapAsyncEnvironment = noop;

function setupWrapAsyncEnvironment() {
  wrapAsyncDepth += 1;
  if (wrapAsyncDepth > 1) return;

  let restoreActEnvironment = noop;

  try {
    restoreActEnvironment = setActEnvironment(false);
    const removeBrowserPolyfills = applyBrowserPolyfills();

    restoreCurrentWrapAsyncEnvironment = () => {
      restoreActEnvironment();
      removeBrowserPolyfills();
    };
  } catch (error) {
    wrapAsyncDepth -= 1;
    restoreActEnvironment();
    throw error;
  }
}

function restoreWrapAsyncEnvironment() {
  wrapAsyncDepth -= 1;
  if (wrapAsyncDepth) return;

  restoreCurrentWrapAsyncEnvironment();
  restoreCurrentWrapAsyncEnvironment = noop;
}

export async function wrapAsync<T>(fn: () => Promise<T>) {
  setupWrapAsyncEnvironment();
  try {
    return await fn();
  } finally {
    restoreWrapAsyncEnvironment();
  }
}
