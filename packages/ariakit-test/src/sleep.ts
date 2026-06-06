import { isBrowser, nextFrame, wrapAsync } from "./__utils.ts";

// The intermediate sub-steps of each interaction now settle without a wall-clock
// delay (see `settle()`), so this delay only applies to the final settle after
// an interaction. It's kept small in non-browser environments — but not zero, as
// a few milliseconds remain load-bearing for some interactions, such as hiding a
// dialog by clicking outside.
const defaultMs = isBrowser ? 150 : 4;

/**
 * Waits for the DOM to settle between simulated interactions by yielding across
 * two animation frames and a short timeout.
 *
 * The other helpers in this package call it internally, but you can await it
 * directly to let pending updates, transitions, or effects flush before asserting.
 * The default delay is small and environment-dependent; pass `ms` to override it.
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
