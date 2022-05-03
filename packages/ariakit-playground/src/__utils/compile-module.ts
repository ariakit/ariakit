import * as React from "react";
import { availablePresets, transform } from "@babel/standalone";
import { hasOwnProperty } from "ariakit-utils/misc";
import { AnyObject } from "ariakit-utils/types";
import { createCSSModule } from "./css-module";
import { getExtension } from "./get-extension";

const requireCache = Object.create(null);

function createModule(exports: AnyObject = {}) {
  return { __esModule: true, ...exports };
}

export function compileModule(
  code: string,
  filename: string,
  getModule?: (path: string) => any,
  transformCache?: AnyObject
) {
  const extension = getExtension(filename);
  const defaultDeps = { react: React };
  const customRequire = (path: string) => {
    const mod = getModule?.(path);
    if (mod != null) {
      requireCache[path] = mod;
      return mod;
    }
    if (hasOwnProperty(defaultDeps, path)) {
      requireCache[path] = defaultDeps[path];
      return defaultDeps[path];
    }
    if (requireCache[path] != null) {
      return requireCache[path];
    }
    throw new Error(`Module not found: Can't resolve '${path}'`);
  };
  if (extension === "css") {
    return createModule(createCSSModule(code));
  }
  if (
    transformCache != null &&
    transformCache[filename] != null &&
    transformCache[filename].code === code
  ) {
    return transformCache[filename].result;
  }
  const compiled = transform(code, {
    filename,
    presets: [
      [availablePresets.env],
      [availablePresets.react],
      [availablePresets.typescript],
    ],
  });
  const compiledCode = `${compiled.code};\nreturn exports`;
  const fn = new Function("require", "exports", "React", compiledCode);
  const result = fn(customRequire, Object.create(null), React);
  if (transformCache) {
    transformCache[filename] = { code, result };
  }
  return result;
}
