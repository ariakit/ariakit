import { isBrowser, nextFrame } from "./__utils";
import { act } from "./act";

const defaultMs = isBrowser ? 150 : 16;

export async function sleep(ms = defaultMs): Promise<void> {
  await act(() => new Promise((resolve) => setTimeout(resolve, ms)));
  await nextFrame();
}
