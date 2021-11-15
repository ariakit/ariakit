import { PlaygroundState } from "../playground-state";

export function getFile(
  values: PlaygroundState["values"] = {},
  filename = Object.keys(values)[0] || ""
) {
  return filename;
}
