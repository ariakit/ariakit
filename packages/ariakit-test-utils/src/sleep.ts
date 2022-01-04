import { act } from "./act";

export function sleep(ms = 16): Promise<void> {
  return act(() => new Promise((resolve) => setTimeout(resolve, ms)));
}
