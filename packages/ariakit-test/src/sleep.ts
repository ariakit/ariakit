import { isBrowser, nextFrame, wrapAsync } from "./__utils.ts";

// The two animation frames in sleep() provide most of the settle time between
// simulated interactions, so this delay is kept small in non-browser
// environments — but not zero, as a few milliseconds remain load-bearing for
// some interactions, such as hiding a dialog by clicking outside.
const defaultMs = isBrowser ? 150 : 8;

export function sleep(ms = defaultMs) {
  return wrapAsync(async () => {
    await nextFrame();
    await new Promise((resolve) => setTimeout(resolve, ms));
    await nextFrame();
  });
}
