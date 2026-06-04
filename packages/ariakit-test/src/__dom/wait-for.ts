// Part of this code is based on https://github.com/testing-library/dom-testing-library/blob/v10.4.1/src/wait-for.ts
// Original work licensed under the MIT License, Copyright (c) Kent C. Dodds.

import { getConfig } from "./config.ts";

export interface WaitForOptions {
  container?: HTMLElement;
  timeout?: number;
  interval?: number;
  onTimeout?: (error: Error) => Error;
  mutationObserverOptions?: MutationObserverInit;
}

// Internal options that `waitForWrapper` forwards to `waitFor`. `stackTraceError`
// is captured at the call site so async stack traces point closer to the
// developer's code instead of the polling internals.
interface InternalWaitForOptions extends WaitForOptions {
  stackTraceError: Error;
}

// Tracks the lifecycle of an async callback's returned promise so we never run
// the callback again while a previous invocation is still pending.
type PromiseStatus = "idle" | "pending" | "resolved" | "rejected";

// Returns the default container when none is provided. Mirrors upstream's
// `getDocument`: tests always run with a `window` available.
function getDocument(): Document {
  if (typeof window === "undefined") {
    throw new Error("Could not find default container");
  }
  return window.document;
}

// Resolves the `window` that owns a node so we use its `MutationObserver`
// constructor (the node may live in a different realm than the global one).
function getWindowFromNode(node: Node): Window & typeof globalThis {
  const ownerDocument = node.ownerDocument;
  if (ownerDocument?.defaultView) {
    return ownerDocument.defaultView;
  }
  // `node` is itself a document.
  const defaultView = (node as Document).defaultView;
  if (defaultView) {
    return defaultView;
  }
  throw new Error(
    "It looks like the window object is not available for the provided node.",
  );
}

// Rewrites `target`'s stack so it reads as if thrown from where `source` was
// created (the caller), keeping `target`'s own message.
function copyStackTrace(target: Error, source: Error) {
  if (!source.stack) return;
  target.stack = source.stack.replace(source.message, target.message);
}

function rawWaitFor<T>(
  callback: () => T | Promise<T>,
  {
    container,
    timeout = getConfig().asyncUtilTimeout,
    stackTraceError,
    interval = 50,
    onTimeout = (error) => error,
    mutationObserverOptions = {
      subtree: true,
      childList: true,
      attributes: true,
      characterData: true,
    },
  }: InternalWaitForOptions,
): Promise<T> {
  if (typeof callback !== "function") {
    throw new TypeError("Received `callback` arg must be a function");
  }
  // Default to the global document so the observer still fires on any DOM
  // change the callback might be waiting on.
  const observedContainer: Node = container ?? getDocument();
  return new Promise<T>((resolve, reject) => {
    let lastError: unknown;
    let promiseStatus: PromiseStatus = "idle";

    const overallTimeoutTimer = setTimeout(handleTimeout, timeout);
    const intervalId = setInterval(checkCallback, interval);
    const { MutationObserver } = getWindowFromNode(observedContainer);
    const observer = new MutationObserver(checkCallback);
    observer.observe(observedContainer, mutationObserverOptions);

    // Run once immediately so a callback that already passes resolves without
    // waiting for the first interval or mutation.
    checkCallback();

    function onDone(error: Error | null, result: T | null) {
      clearTimeout(overallTimeoutTimer);
      clearInterval(intervalId);
      observer.disconnect();
      if (error) {
        reject(error);
        return;
      }
      resolve(result as T);
    }

    function checkCallback() {
      // Don't re-enter while an async callback's promise is still pending.
      if (promiseStatus === "pending") return;
      try {
        const result = callback();
        if (typeof (result as Promise<T>)?.then === "function") {
          promiseStatus = "pending";
          (result as Promise<T>).then(
            (resolvedValue) => {
              promiseStatus = "resolved";
              onDone(null, resolvedValue);
            },
            (rejectedValue) => {
              promiseStatus = "rejected";
              lastError = rejectedValue;
            },
          );
          return;
        }
        onDone(null, result as T);
        // If `callback` throws, wait for the next mutation, interval, or
        // timeout.
      } catch (error) {
        // Save the most recent callback error to reject the promise with it in
        // the event of a timeout.
        lastError = error;
      }
    }

    function handleTimeout() {
      let error: Error;
      if (lastError) {
        // Reject with the callback's most recent error (an assertion failure or
        // a `getBy*` "not found" error), keeping its own stack so the failure
        // points at the caller's code rather than this polling loop.
        error = lastError as Error;
      } else {
        error = new Error("Timed out in waitFor.");
        copyStackTrace(error, stackTraceError);
      }
      onDone(onTimeout(error), null);
    }
  });
}

/**
 * Repeatedly calls `callback` until it stops throwing (or its returned promise
 * resolves), polling on an interval and on DOM mutations, until `timeout`
 * elapses.
 *
 * The call is delegated through `getConfig().asyncWrapper` so the React
 * integration can toggle the act environment and drain microtasks around the
 * polling promise.
 */
export function waitFor<T>(
  callback: () => T | Promise<T>,
  options?: WaitForOptions,
): Promise<T> {
  // Create the error here so its stack trace is as close to the calling code
  // as possible.
  const stackTraceError = new Error("STACK_TRACE_MESSAGE");
  return getConfig().asyncWrapper(() =>
    rawWaitFor(callback, { stackTraceError, ...options }),
  );
}
