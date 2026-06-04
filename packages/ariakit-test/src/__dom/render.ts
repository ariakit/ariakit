// Part of this code is based on https://github.com/testing-library/react-testing-library/blob/v16.3.2/src/pure.js
// and https://github.com/testing-library/react-testing-library/blob/v16.3.2/src/act-compat.js
// Original work licensed under the MIT License, Copyright (c) Kent C. Dodds.

import * as React from "react";
import * as ReactDOMClient from "react-dom/client";
// Imported statically (like Testing Library) so the module stays synchronous.
// React 18.3+ and 19 expose `React.act`, so this fallback is only used by older
// React 18 builds; importing the namespace never triggers the deprecation that
// only fires when its `act` is actually called.
import * as ReactDOMTestUtils from "react-dom/test-utils";
import { configure } from "./config.ts";

/**
 * Callback passed to {@link act}. May be synchronous or return a promise.
 */
type ActCallback<T> = () => T | Promise<T>;

/**
 * `act` always resolves to a thenable so async callbacks can be awaited.
 */
type ActResult<T> = T extends Promise<unknown> ? Promise<Awaited<T>> : T;

/**
 * Resolves the global object across the runtimes this package may run in
 * (browsers, workers, Node). React reads the act flag from `globalThis`, so we
 * write it to the same place.
 */
function getGlobalThis() {
  if (typeof globalThis !== "undefined") return globalThis;
  if (typeof self !== "undefined") return self;
  if (typeof window !== "undefined") return window;
  if (typeof global !== "undefined") return global;
  throw new Error("unable to locate global object");
}

interface ActEnvironmentGlobal {
  IS_REACT_ACT_ENVIRONMENT?: boolean;
}

/**
 * Sets the `IS_REACT_ACT_ENVIRONMENT` flag React checks before warning about
 * updates that happen outside of `act`.
 */
export function setReactActEnvironment(
  isReactActEnvironment: boolean | undefined,
) {
  (getGlobalThis() as ActEnvironmentGlobal).IS_REACT_ACT_ENVIRONMENT =
    isReactActEnvironment;
}

/**
 * Reads the current `IS_REACT_ACT_ENVIRONMENT` flag.
 */
export function getIsReactActEnvironment() {
  return (getGlobalThis() as ActEnvironmentGlobal).IS_REACT_ACT_ENVIRONMENT;
}

type ReactActImplementation = <T>(callback: ActCallback<T>) => ActResult<T>;

/**
 * Wraps a React `act` implementation so the act environment is enabled for the
 * duration of the callback and restored afterwards. The returned value is
 * always a thenable for async callbacks, matching Testing Library's behavior so
 * callers can `await` it without knowing whether the callback was async.
 */
function withGlobalActEnvironment(actImplementation: ReactActImplementation) {
  return <T>(callback: ActCallback<T>): ActResult<T> => {
    const previousActEnvironment = getIsReactActEnvironment();
    setReactActEnvironment(true);
    try {
      // The return value of `act` is always a thenable.
      let callbackNeedsToBeAwaited = false;
      const actResult = actImplementation(() => {
        const result = callback();
        if (
          result !== null &&
          typeof result === "object" &&
          typeof (result as PromiseLike<unknown>).then === "function"
        ) {
          callbackNeedsToBeAwaited = true;
        }
        return result;
      });
      if (callbackNeedsToBeAwaited) {
        const thenable = actResult as PromiseLike<Awaited<T>>;
        const wrapped: PromiseLike<Awaited<T>> = {
          then: (resolve, reject) => {
            return thenable.then(
              (returnValue) => {
                setReactActEnvironment(previousActEnvironment);
                return resolve ? resolve(returnValue) : (returnValue as never);
              },
              (error) => {
                setReactActEnvironment(previousActEnvironment);
                if (reject) return reject(error);
                throw error;
              },
            );
          },
        };
        return wrapped as ActResult<T>;
      }
      setReactActEnvironment(previousActEnvironment);
      return actResult;
    } catch (error) {
      // Can't be a `finally {}` block since we don't know if we have to
      // immediately restore IS_REACT_ACT_ENVIRONMENT or if we have to await the
      // callback first.
      setReactActEnvironment(previousActEnvironment);
      throw error;
    }
  };
}

/**
 * `React.act` exists in React 18.3+ and 19. Only older React 18 builds (which
 * lack `React.act`) fall back to the deprecated `react-dom/test-utils` `act`,
 * which is imported statically at the top of this module; the deprecation it
 * logs only fires when that `act` is actually called, never on supported
 * versions.
 */
const reactAct: ReactActImplementation =
  typeof React.act === "function"
    ? (React.act as ReactActImplementation)
    : (ReactDOMTestUtils.act as ReactActImplementation);

/**
 * Runs `callback` inside React's `act`, flushing effects and state updates. The
 * act environment flag is toggled around the call so updates triggered by event
 * dispatch and `waitFor` are batched the way React expects in tests.
 */
export const act = withGlobalActEnvironment(reactAct);

/**
 * Options accepted by {@link render}.
 */
export interface RenderOptions {
  /**
   * The DOM node the component is rendered into. Defaults to a fresh `<div>`
   * appended to `baseElement`.
   */
  container?: HTMLElement;
  /**
   * The container's parent, used as the base for queries. Defaults to
   * `document.body`.
   */
  baseElement?: HTMLElement;
  /**
   * Hydrate the container's existing markup instead of rendering from scratch.
   */
  hydrate?: boolean;
  /**
   * A component that wraps the rendered UI, e.g. a context provider.
   */
  wrapper?: React.JSXElementConstructor<{ children: React.ReactNode }>;
  /**
   * Forwarded to `createRoot`/`hydrateRoot` as `onCaughtError`.
   */
  onCaughtError?: (...args: any[]) => void;
  /**
   * Forwarded to `createRoot`/`hydrateRoot` as `onRecoverableError`.
   */
  onRecoverableError?: (...args: any[]) => void;
  /**
   * Wrap the rendered UI in `React.StrictMode`.
   */
  reactStrictMode?: boolean;
  /**
   * Unused; accepted for compatibility with Testing Library's signature.
   */
  queries?: unknown;
}

/**
 * Value returned by {@link render}.
 */
export interface RenderResult {
  /** The node the UI was rendered into. */
  container: HTMLElement;
  /** The base element used for queries. */
  baseElement: HTMLElement;
  /** Unmounts the rendered tree. */
  unmount: () => void;
  /** Re-renders the same root with new UI. */
  rerender: (ui: React.ReactNode) => void;
  /** Snapshots the container's current HTML as a `DocumentFragment`. */
  asFragment: () => DocumentFragment;
  /** Logs the container's markup; kept for API compatibility. */
  debug: (...args: any[]) => void;
}

/**
 * Internal handle over a concurrent React root, mirroring the small surface
 * `renderRoot` relies on.
 */
interface MountedRoot {
  hydrate: () => void;
  render: (element: React.ReactNode) => void;
  unmount: () => void;
}

interface MountedRootEntry {
  container: HTMLElement;
  root: MountedRoot;
}

// Ideally we'd just use a WeakMap where containers are keys and roots are
// values. We use two structures so that we can bail out in constant time when we
// render with a new container (the most common use case).
const mountedContainers = new Set<HTMLElement>();
const mountedRootEntries: MountedRootEntry[] = [];

function strictModeIfNeeded(
  innerElement: React.ReactNode,
  reactStrictMode: boolean | undefined,
) {
  if (!reactStrictMode) return innerElement;
  return React.createElement(React.StrictMode, null, innerElement);
}

function wrapUiIfNeeded(
  innerElement: React.ReactNode,
  wrapperComponent: RenderOptions["wrapper"],
) {
  if (!wrapperComponent) return innerElement;
  return React.createElement(wrapperComponent, null, innerElement);
}

interface CreateRootContext {
  hydrate: boolean;
  onCaughtError: RenderOptions["onCaughtError"];
  onRecoverableError: RenderOptions["onRecoverableError"];
  ui: React.ReactNode;
  wrapper: RenderOptions["wrapper"];
  reactStrictMode: boolean | undefined;
}

/**
 * Creates a concurrent React root for `container`. Hydration happens eagerly
 * when the root is created (so the initial markup is matched against `ui`);
 * otherwise the root is created empty and populated by `renderRoot`.
 */
function createConcurrentRoot(
  container: HTMLElement,
  {
    hydrate,
    onCaughtError,
    onRecoverableError,
    ui,
    wrapper,
    reactStrictMode,
  }: CreateRootContext,
): MountedRoot {
  let root: ReactDOMClient.Root;
  if (hydrate) {
    act(() => {
      root = ReactDOMClient.hydrateRoot(
        container,
        strictModeIfNeeded(wrapUiIfNeeded(ui, wrapper), reactStrictMode),
        { onCaughtError, onRecoverableError },
      );
    });
  } else {
    root = ReactDOMClient.createRoot(container, {
      onCaughtError,
      onRecoverableError,
    });
  }
  return {
    hydrate() {
      // Hydration already happened above when the root was created, so the
      // initial `renderRoot` call must not render again (that would trigger
      // React's client-render fallback). Mirrors @testing-library/react's
      // concurrent hydrate root: a no-op for a hydrate-created root, but a guard
      // against calling `render(..., { hydrate: true })` on a root that was
      // first rendered normally.
      if (!hydrate) {
        throw new Error(
          "Attempted to hydrate a non-hydrateable root. This is a bug in `@ariakit/test`.",
        );
      }
    },
    render(element) {
      root.render(element);
    },
    unmount() {
      root.unmount();
    },
  };
}

interface RenderRootContext {
  baseElement: HTMLElement;
  container: HTMLElement;
  hydrate?: boolean;
  root: MountedRoot;
  wrapper: RenderOptions["wrapper"];
  reactStrictMode: boolean | undefined;
}

/**
 * Renders `ui` into an existing root inside `act` and returns the render
 * result. `rerender` recurses here to reuse the same root.
 */
function renderRoot(
  ui: React.ReactNode,
  {
    baseElement,
    container,
    hydrate,
    root,
    wrapper,
    reactStrictMode,
  }: RenderRootContext,
): RenderResult {
  act(() => {
    if (hydrate) {
      // The initial hydration render already ran when the root was created.
      root.hydrate();
    } else {
      root.render(
        strictModeIfNeeded(wrapUiIfNeeded(ui, wrapper), reactStrictMode),
      );
    }
  });
  return {
    container,
    baseElement,
    debug: () => {
      // The upstream `debug` dumps the DOM with `prettyDOM`; ariakit never uses
      // it, so this is a no-op kept for API compatibility.
    },
    unmount: () => {
      act(() => {
        root.unmount();
      });
    },
    rerender: (rerenderUi) => {
      renderRoot(rerenderUi, {
        container,
        baseElement,
        root,
        wrapper,
        reactStrictMode,
      });
      // Intentionally do not return anything to avoid unnecessarily
      // complicating the API. Folks can use all the same utilities we return in
      // the first place that are bound to the container.
    },
    asFragment: () => {
      if (typeof document.createRange === "function") {
        return document
          .createRange()
          .createContextualFragment(container.innerHTML);
      }
      const template = document.createElement("template");
      template.innerHTML = container.innerHTML;
      return template.content;
    },
  };
}

/**
 * Renders a React element into the document using a concurrent root and returns
 * helpers to interact with the result. Defaults `baseElement` to
 * `document.body` and `container` to a fresh `<div>` appended to it. Rendering
 * into a container that was already rendered into reuses the same root.
 * @example
 * ```tsx
 * const { rerender, unmount } = render(<App />);
 * rerender(<App theme="dark" />);
 * unmount();
 * ```
 */
export function render(
  ui: React.ReactNode,
  {
    container,
    baseElement = container,
    onCaughtError,
    onRecoverableError,
    hydrate = false,
    wrapper,
    reactStrictMode,
  }: RenderOptions = {},
): RenderResult {
  // Install the act integration before rendering so the event dispatch and
  // async polling that follow this render run inside React's `act`.
  configureActIntegration();
  if (!baseElement) {
    // Default to document.body instead of documentElement to avoid output of
    // potentially-large head elements (such as JSS style blocks) in debug
    // output.
    baseElement = document.body;
  }
  if (!container) {
    container = baseElement.appendChild(document.createElement("div"));
  }

  let root: MountedRoot | undefined;
  // The root is created first; only later is it re-used, so the negated
  // condition maps the common "new container" case first.
  if (!mountedContainers.has(container)) {
    root = createConcurrentRoot(container, {
      hydrate,
      onCaughtError,
      onRecoverableError,
      ui,
      wrapper,
      reactStrictMode,
    });
    mountedRootEntries.push({ container, root });
    // We add it to the mounted containers regardless of whether it's actually
    // attached to document.body so cleanup works whether or not the caller
    // passed a custom container.
    mountedContainers.add(container);
  } else {
    for (const rootEntry of mountedRootEntries) {
      if (rootEntry.container === container) {
        root = rootEntry.root;
      }
    }
  }

  // Unreachable: every tracked container has a matching root entry.
  if (!root) {
    throw new Error("Could not find a root for the given container.");
  }

  return renderRoot(ui, {
    container,
    baseElement,
    hydrate,
    wrapper,
    root,
    reactStrictMode,
  });
}

/**
 * Unmounts every tree rendered by {@link render} and removes any containers
 * that `render` appended to `document.body`. Call this between tests to reset
 * the DOM.
 */
export function cleanup() {
  for (const { root, container } of mountedRootEntries) {
    act(() => {
      root.unmount();
    });
    if (container.parentNode === document.body) {
      document.body.removeChild(container);
    }
  }
  mountedRootEntries.length = 0;
  mountedContainers.clear();
}

let actIntegrationConfigured = false;

// Wires the act integration into the shared config so event dispatch and async
// polling flush React updates — mirroring @testing-library/react's `configure`
// call. It runs the first time `render` is used rather than at module import,
// so the package keeps an honest `"sideEffects": false`: there is no import-time
// side effect for a bundler to strip, yet any `render` call installs the
// integration before the test interacts with the rendered tree.
function configureActIntegration() {
  if (actIntegrationConfigured) return;
  actIntegrationConfigured = true;
  configure({
    eventWrapper: (callback) => {
      let result: ReturnType<typeof callback> | undefined;
      act(() => {
        result = callback();
      });
      // `act` is synchronous for synchronous callbacks, so `result` is set.
      return result as ReturnType<typeof callback>;
    },
    // We just want to run `waitFor` without IS_REACT_ACT_ENVIRONMENT, but that's
    // not necessarily how `asyncWrapper` is used since it's a public method.
    asyncWrapper: async (callback) => {
      const previousActEnvironment = getIsReactActEnvironment();
      setReactActEnvironment(false);
      try {
        const result = await callback();
        // Drain the microtask queue. Otherwise we'd restore the previous act()
        // environment before resolving the `waitFor` call, leaving the caller no
        // chance to wrap the in-flight promises in `act()`.
        await new Promise<void>((resolve) => {
          setTimeout(() => resolve(), 0);
        });
        return result;
      } finally {
        setReactActEnvironment(previousActEnvironment);
      }
    },
  });
}
