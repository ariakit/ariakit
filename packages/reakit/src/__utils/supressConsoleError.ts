/* eslint-disable no-console */
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
