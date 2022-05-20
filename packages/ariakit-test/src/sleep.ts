import { isJSDOM, nextFrame } from "./__utils";
import { act } from "./act";

const defaultMs = isJSDOM ? 16 : 200;

export async function sleep(ms = defaultMs): Promise<void> {
  await act(() => new Promise((resolve) => setTimeout(resolve, ms)));
  await nextFrame();
}
