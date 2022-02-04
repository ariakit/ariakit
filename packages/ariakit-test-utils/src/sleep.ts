import { nextFrame } from "./__utils";
import { act } from "./act";

export async function sleep(ms = 16): Promise<void> {
  await act(() => new Promise((resolve) => setTimeout(resolve, ms)));
  await nextFrame();
}
