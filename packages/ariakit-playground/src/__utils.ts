import * as React from "react";
import { css } from "@emotion/css";
import { transform, availablePresets } from "@babel/standalone";
import { createStoreContext } from "ariakit-utils/store";
import { hasOwnProperty } from "ariakit-utils/misc";
import { AnyObject } from "ariakit-utils/types";
import { PlaygroundState } from "./playground-state";

const CSS_EXPORT = Symbol("css");
const requireCache = Object.create(null);

function createModule(exports: AnyObject = {}) {
  return { __esModule: true, ...exports };
}

export const PlaygroundContext = createStoreContext<PlaygroundState>();

export function getExtension(filename?: string) {
  const extension = filename?.split(".").pop();
  if (!extension) return;
  return extension.toLowerCase();
}

export function compileModule(
  code: string,
  filename: string,
  requireModule?: (path: string) => any
) {
  const extension = getExtension(filename);
  const defaultDeps = { react: React };
  const customRequire = (path: string) => {
    const mod = requireModule?.(path);
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
    return createModule({ [CSS_EXPORT]: css(code) });
  }
  const compiled = transform(code, {
    filename,
    presets: [
      [availablePresets.env],
      [availablePresets.react],
      [availablePresets.typescript],
    ],
  });
  const compiledCode = `${compiled.code}; return exports`;
  const fn = new Function("require", "exports", "React", compiledCode);
  return fn(customRequire, Object.create(null), React);
}

export function compileComponent(
  code: string,
  filename: string,
  requireModule?: (path: string) => any
) {
  const compiledModule = compileModule(code, filename, requireModule);
  if (compiledModule.default) {
    return compiledModule.default;
  }
  const firstPascalCaseExport = Object.keys(compiledModule).find((key) =>
    /^[A-Z]/.test(key)
  );
  if (firstPascalCaseExport) {
    return compiledModule[firstPascalCaseExport];
  }
  return;
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
