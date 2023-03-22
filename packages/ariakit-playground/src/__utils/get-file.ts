import { PlaygroundStoreState } from "../playground-store.js";

export function getFile(
  values: PlaygroundStoreState["values"] = {},
  filename = Object.keys(values)[0] || ""
) {
  return filename;
}
