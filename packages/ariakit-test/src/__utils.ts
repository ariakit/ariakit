import { noop } from "@ariakit/utils";

export type DirtiableElement = Element & { dirty?: boolean };

export type TextField = HTMLInputElement | HTMLTextAreaElement;

const preventMouseEvents = new WeakMap<Document, boolean>();

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

function macrotask() {
  // Yield behind the host-scheduler primitive React drives its concurrent work
  // loop with, so a turn runs after a React slice already queued on it: React 18
  // prefers `setImmediate` in Node (the environment the suites run in) and falls
  // back to `MessageChannel` in browser/worker builds, so route through the same
  // order. Plain `setTimeout` is the last resort.
  return new Promise<void>((resolve) => {
    if (typeof setImmediate === "function") {
      setImmediate(resolve);
    } else if (typeof MessageChannel !== "undefined") {
      const channel = new MessageChannel();
      channel.port1.onmessage = () => {
        channel.port1.close();
        resolve();
      };
      channel.port2.postMessage(undefined);
    } else {
      setTimeout(resolve);
    }
  });
}

// Drains pending host-scheduler work so a settle doesn't return mid-commit.
// React 18 runs concurrently while simulated interactions run (the act
// environment is disabled in `wrapAsync`), so it can split a render or commit
// across several scheduler tasks when it judges the frame budget spent — which
// happens more readily under CPU contention on CI. A fixed wall-clock settle can
// then return between two slices, leaving the DOM momentarily unsettled. Yield
// through the scheduler's own macrotask repeatedly so each pending slice runs,
// stopping once two consecutive turns pass without a DOM mutation (a committed
// React update mutates the tree, and the MutationObserver callback is flushed
// within the turn). This is a bounded best effort: `maxTurns` caps the drain so
// a runaway scheduler can't hang the settle, and a render that takes several
// non-committing slices could still exit early — but the suites' updates commit
// well within the budget. Each turn is a no-op when the queue is empty, so the
// common already-settled case costs about two round-trips.
export async function flushScheduler(maxTurns = 10) {
  if (
    typeof document === "undefined" ||
    typeof MutationObserver === "undefined"
  ) {
    await macrotask();
    await flushMicrotasks();
    return;
  }
  let mutated = false;
  const observer = new MutationObserver(() => {
    mutated = true;
  });
  observer.observe(document, {
    subtree: true,
    childList: true,
    attributes: true,
    characterData: true,
  });
  try {
    let stableTurns = 0;
    for (let turn = 0; turn < maxTurns; turn += 1) {
      mutated = false;
      await macrotask();
      await flushMicrotasks();
      // A mutation may be observed a microtask after it lands, so require two
      // consecutive quiet turns before treating the tree as settled. This keeps
      // a render slice that hasn't committed its DOM changes yet from ending the
      // drain early.
      stableTurns = mutated ? 0 : stableTurns + 1;
      if (stableTurns >= 2) break;
    }
  } finally {
    observer.disconnect();
  }
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

export function getPreventMouseEvents(document: Document) {
  return preventMouseEvents.get(document) ?? false;
}

export function setPreventMouseEvents(document: Document, value: boolean) {
  preventMouseEvents.set(document, value);
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

// Settles between the sub-steps of a single simulated interaction by yielding
// across two animation frames and flushing microtasks — but without a
// wall-clock delay. The components under test schedule their per-step updates
// through microtasks and animation frames (`queueMicrotask`,
// `requestAnimationFrame`), so this is enough to let a sub-step's work flush
// before the next one. The wall-clock `sleep()` is reserved for the final
// settle of an interaction, where a real timer can still be load-bearing (e.g.
// hiding a dialog by clicking outside).
export function settle() {
  return wrapAsync(async () => {
    await nextFrame();
    await flushMicrotasks();
    await nextFrame();
  });
}
