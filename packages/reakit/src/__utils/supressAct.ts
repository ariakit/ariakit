import { isPromise } from "./isPromise";

/* eslint-disable no-console,es/no-async-functions */
// TODO: https://github.com/facebook/react/pull/14853
export function supressAct(callback: () => any) {
  return async () => {
    const consoleError = console.error.bind(console);
    const consoleWarn = console.warn.bind(console);
    console.error = () => {};
    console.warn = () => {};
    const restore = () =>
      new Promise(resolve => {
        setTimeout(() => {
          console.error = consoleError;
          console.warn = consoleWarn;
          resolve();
        });
      });
    const result = callback();
    if (isPromise(result)) {
      try {
        await result;
        return restore();
      } catch (e) {
        restore();
        throw e;
      }
    }
    return restore();
  };
}
