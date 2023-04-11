import { isBrowser, nextFrame } from "./__utils.js";
import { act } from "./act.js";

const defaultMs = isBrowser ? 150 : 10;

export async function sleep(ms = defaultMs): Promise<void> {
  await nextFrame();
  await act(() => new Promise((resolve) => setTimeout(resolve, ms)));
}
