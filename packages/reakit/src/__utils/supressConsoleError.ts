/* eslint-disable no-console */
// TODO: https://github.com/facebook/react/pull/14853
export function supressConsoleError() {
  const consoleError = console.error.bind(console);
  const consoleWarn = console.warn.bind(console);
  console.error = () => {};
  console.warn = () => {};
  return () => {
    console.error = consoleError;
    console.warn = consoleWarn;
  };
}
