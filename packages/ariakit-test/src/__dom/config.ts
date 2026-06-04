// Part of this code is based on https://github.com/testing-library/dom-testing-library/blob/v10.4.1/src/config.ts
// Original work licensed under the MIT License, Copyright (c) Kent C. Dodds.

/**
 * Internal configuration shared across the reimplemented DOM testing utilities.
 *
 * The `asyncWrapper` and `eventWrapper` hooks mirror the indirection Testing
 * Library uses to let a framework integration (here, `./render.ts`) wrap async
 * polling and event dispatch in React's `act`. They default to identity so the
 * non-React entry points behave like plain DOM helpers.
 */
export interface Config {
  /**
   * Wraps `waitFor` execution. The React integration overrides this to toggle
   * the act environment and drain microtasks around the polling promise.
   */
  asyncWrapper: <T>(callback: () => Promise<T>) => Promise<T>;
  /**
   * Wraps a single event dispatch. The React integration overrides this to run
   * the dispatch inside `act` so state updates flush synchronously.
   */
  eventWrapper: <T>(callback: () => T) => T;
  /**
   * Default timeout, in milliseconds, for async utilities such as `waitFor`.
   */
  asyncUtilTimeout: number;
}

let config: Config = {
  asyncWrapper: (callback) => callback(),
  eventWrapper: (callback) => callback(),
  asyncUtilTimeout: 1000,
};

export function getConfig() {
  return config;
}

export function configure(
  delta: Partial<Config> | ((config: Config) => Partial<Config>),
) {
  const newConfig = typeof delta === "function" ? delta(config) : delta;
  config = { ...config, ...newConfig };
}
