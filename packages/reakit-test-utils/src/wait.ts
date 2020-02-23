import { wait as testingLibraryWait } from "@testing-library/react";

export function wait(
  callback?: (() => void) | number,
  options?: { timeout?: number; interval?: number }
): Promise<void> {
  if (typeof callback === "number") {
    return testingLibraryWait(undefined, { ...options, interval: callback });
  }
  return testingLibraryWait(callback, options);
}
