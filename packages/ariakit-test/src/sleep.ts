import { flushScheduler, isBrowser, nextFrame, wrapAsync } from "./__utils.ts";

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
 * Outside a real browser it also drains the host scheduler so concurrent React
 * work that the delay raced past settles before the call resolves.
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
    // Drain any React work the wall-clock timer above raced past. Under load,
    // React 18 can defer a commit to a later scheduler task than a fixed delay
    // covers; this flushes those slices so the DOM is settled before asserting.
    // Skipped in real browsers, where the larger delay already absorbs it.
    if (!isBrowser) await flushScheduler();
    await nextFrame();
  });
}
