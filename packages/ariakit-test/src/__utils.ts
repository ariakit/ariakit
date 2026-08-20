import { getDocument, getWindow, noop } from "@ariakit/utils";

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

export type OwnerWindowSource = Window | Document | Node | null | undefined;

/**
 * The window that owns `target`, which is the realm `@testing-library/dom`
 * builds an event in, or `null` when none can be resolved. Read a constructor
 * from here rather than from the ambient global whenever the target may live in
 * a same-origin iframe, because that frame has interfaces of its own.
 * https://github.com/ariakit/ariakit/issues/7195
 */
export function getOwnerWindow(target: OwnerWindowSource) {
  if (!target) return null;
  // `getWindow` resolves the realm defensively, because a form exposes its
  // controls as named properties that override built-ins and a document does
  // the same for the elements it names. It falls back to the ambient window
  // rather than reporting failure, so the target's own view is the one that
  // owns the target's document back. Everything else reports absent, which is
  // what both callers fall back on.
  // https://github.com/ariakit/ariakit/issues/7209
  const view = getWindow(target);
  return view.document === getDocument(target) ? view : null;
}

export const isBrowser =
  typeof navigator !== "undefined" &&
  !navigator.userAgent.includes("jsdom") &&
  typeof window !== "undefined" &&
  !isHappyDOM();

// happy-dom omits `window.event`, so React 18 assigns native-listener updates
// default rather than discrete priority. Expose the active event only during
// dispatch, restoring it for nested events to match jsdom and browsers.
// https://github.com/ariakit/ariakit/pull/6404#discussion_r3454880546
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
  // Yield through React's preferred host-scheduler primitive so queued
  // concurrent work runs before settling.
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

// React 18 may split a commit across scheduler tasks under CI load. Wait for
// two mutation-free host turns, bounded by `maxTurns`, so settling does not
// return mid-commit. See https://github.com/ariakit/ariakit/pull/6265
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
