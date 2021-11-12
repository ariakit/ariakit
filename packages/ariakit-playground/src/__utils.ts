import { createStoreContext } from "ariakit-utils/store";
import { AnyObject } from "ariakit-utils/types";
import { PlaygroundState } from "./playground-state";

export const CSS_EXPORT = Symbol("css");

export const PlaygroundContext = createStoreContext<PlaygroundState>();

export function getExtension(filename?: string) {
  const extension = filename?.split(".").pop();
  if (!extension) return;
  return extension.toLowerCase();
}

export function resolveModule(path: string, availableFilenames: string[]) {
  const normalizedPath = path.replace(/^\.\/(.+)\/?$/, "$1");
  const paths = [
    normalizedPath,
    `${normalizedPath}.ts`,
    `${normalizedPath}.tsx`,
    `${normalizedPath}.js`,
    `${normalizedPath}.jsx`,
    `${normalizedPath}/index.ts`,
    `${normalizedPath}/index.tsx`,
    `${normalizedPath}/index.js`,
    `${normalizedPath}/index.jsx`,
  ];
  for (const filename of paths) {
    if (availableFilenames.includes(filename)) {
      return filename;
    }
  }
  return null;
}

export function getModuleCSS(module: AnyObject) {
  return module[CSS_EXPORT];
}

export function getValue(state?: PlaygroundState, filename?: string) {
  if (!state) return "";
  if (!filename) return "";
  return state.values[filename] ?? "";
}

export function getFile(
  values: PlaygroundState["values"] = {},
  filename = Object.keys(values)[0] || ""
) {
  return filename;
}
