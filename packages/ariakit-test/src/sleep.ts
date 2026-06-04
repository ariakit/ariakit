import { isBrowser, nextFrame, wrapAsync } from "./__utils.ts";

// The two animation frames in sleep() provide most of the settle time between
// simulated interactions, so this delay is kept small in non-browser
// environments — but not zero, as a few milliseconds remain load-bearing for
// some interactions, such as hiding a dialog by clicking outside.
const defaultMs = isBrowser ? 150 : 8;

/**
 * Waits for the DOM to settle between simulated interactions by yielding across
 * two animation frames and a short timeout. The other helpers in this package
 * call it internally, but you can await it directly to let pending updates,
 * transitions, or effects flush before asserting. The default delay is small and
 * environment-dependent; pass `ms` to override it.
 * @example
 * ```ts
 * await click(q.button("Open"));
 * await sleep();
 * expect(q.dialog()).toBeVisible();
 * ```
 */
export function sleep(ms = defaultMs) {
  return wrapAsync(async () => {
    await nextFrame();
    await new Promise((resolve) => setTimeout(resolve, ms));
    await nextFrame();
  });
}
