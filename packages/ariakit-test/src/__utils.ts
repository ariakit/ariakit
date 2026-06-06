import { noop } from "@ariakit/utils";

export type DirtiableElement = Element & { dirty?: boolean };

export type TextField = HTMLInputElement | HTMLTextAreaElement;

export const isHappyDOM = typeof window !== "undefined" && "happyDOM" in window;

export const isBrowser =
  typeof navigator !== "undefined" &&
  !navigator.userAgent.includes("jsdom") &&
  typeof window !== "undefined" &&
  !isHappyDOM;

export async function flushMicrotasks() {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
}

export function nextFrame() {
  return new Promise(requestAnimationFrame);
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

let wrapAsyncDepth = 0;
let restoreCurrentWrapAsyncEnvironment = noop;

// The act environment is toggled per interaction — disabled while simulated
// events run, restored afterwards. The depth guard ensures only the outermost
// `wrapAsync` toggles it, so nested calls don't restore it early; the act
// environment is set before the counter is bumped so a throw can't leave the
// counter stuck above zero. The browser shims are applied once at import (see
// `shims.ts`), not here.
function setupWrapAsyncEnvironment() {
  if (wrapAsyncDepth === 0) {
    restoreCurrentWrapAsyncEnvironment = setActEnvironment(false);
  }
  wrapAsyncDepth += 1;
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
