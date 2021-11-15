import { PlaygroundState } from "../playground-state";

export function getValue(state?: PlaygroundState, filename?: string) {
  if (!state) return "";
  if (!filename) return "";
  return state.values[filename] ?? "";
}
