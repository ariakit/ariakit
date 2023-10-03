import * as DOMTestingLibrary from "@testing-library/dom";
import { wrapAsync } from "./__utils.js";

export function waitFor<T>(
  callback: () => T,
  options?: DOMTestingLibrary.waitForOptions,
) {
  return wrapAsync(() => DOMTestingLibrary.waitFor(callback, options));
}
