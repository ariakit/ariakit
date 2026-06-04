import * as DOMTestingLibrary from "@testing-library/dom";
import { wrapAsync } from "./__utils.ts";

/**
 * Re-runs a callback until it stops throwing or the timeout is reached,
 * re-exporting Testing Library's `waitFor` with this package's async batching
 * applied. Use it to wait for an assertion to pass after an asynchronous update.
 * Pass `options` to configure the `timeout`, `interval`, and other behavior.
 * @example
 * ```ts
 * await click(q.button("Close"));
 * await waitFor(() => expect(q.dialog()).not.toBeInTheDocument());
 * ```
 */
export function waitFor<T>(
  callback: () => T,
  options?: DOMTestingLibrary.waitForOptions,
) {
  return wrapAsync(() => DOMTestingLibrary.waitFor(callback, options));
}
