import { isBrowser, nextFrame, wrapAsync } from "./__utils.js";

const defaultMs = isBrowser ? 150 : 0;

export function sleep(ms = defaultMs) {
  return wrapAsync(async () => {
    await nextFrame();
    await new Promise((resolve) => setTimeout(resolve, ms));
    await nextFrame();
  });
}
