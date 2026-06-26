import { noop } from "@ariakit/utils";

export type DirtiableElement = Element & { dirty?: boolean };

export type TextField = HTMLInputElement | HTMLTextAreaElement;

const preventMouseEvents = new WeakMap<Document, boolean>();

export function isHappyDOM(
  win: Window | null | undefined = typeof window !== "undefined"
    ? window
    : undefined,
) {
  return !!win && "happyDOM" in win;
}

export const isBrowser =
  typeof navigator !== "undefined" &&
  !navigator.userAgent.includes("jsdom") &&
  typeof window !== "undefined" &&
  !isHappyDOM();

// happy-dom doesn't implement the legacy `window.event` global, while jsdom and
// real browsers expose the event currently being dispatched there for the
// synchronous duration of the dispatch. React 18 reads `window.event` in
// `getCurrentEventPriority` to classify an update triggered synchronously inside
// a native event listener: a `click`/`keydown` yields DiscreteEventPriority
// (sync lane, flushed in a microtask), whereas a missing `window.event` falls
// back to DefaultEventPriority (default lane, flushed a macrotask later through
// the scheduler). That later flush lets a microtask-coalesced store batch run
// before React commits — e.g. a controlled `<Dialog open>` re-applies its stale
// `open` prop right after `store.hide()`, transiently re-opening the dialog and
// corrupting focus restoration on outside-click. Mirror jsdom by exposing the
// dispatched event on `window.event` only while listeners run, then restoring
// the previous value — or removing the property again when the environment had
// none — so nested dispatches stay correct and the global isn't left behind. In
// practice this only changes the React 18 suite: the controlled-dialog focus
// divergence it fixes doesn't reproduce under React 19.
export function withWindowEvent<T>(
  event: Event,
  run: () => T,
  win: Window | null | undefined = typeof window !== "undefined"
    ? window
    : undefined,
): T {
  if (!isHappyDOM(win)) return run();
  const eventWindow = win as Window & { event?: Event };
  const had = Object.prototype.hasOwnProperty.call(eventWindow, "event");
  const previous = eventWindow.event;
  eventWindow.event = event;
  try {
    return run();
  } finally {
    if (had) {
      eventWindow.event = previous;
    } else {
      delete eventWindow.event;
    }
  }
}

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
