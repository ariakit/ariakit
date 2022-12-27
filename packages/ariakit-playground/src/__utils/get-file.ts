import { PlaygroundStoreState } from "../playground-store";

export function getFile(
  values: PlaygroundStoreState["values"] = {},
  filename = Object.keys(values)[0] || ""
) {
  return filename;
}
