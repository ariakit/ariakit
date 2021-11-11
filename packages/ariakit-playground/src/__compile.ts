import * as React from "react";
import { availablePresets, transform } from "@babel/standalone";
import { css } from "@emotion/css";
import { hasOwnProperty } from "ariakit-utils/misc";
import { AnyObject } from "ariakit-utils/types";
import { CSS_EXPORT, getExtension } from "./__utils";

const requireCache = Object.create(null);

const { warn } = console;

// TODO: Find a better way to do this.
console.warn = (...args) => {
  for (const arg of args) {
    if (
      arg.includes(
        "Critical dependency: the request of a dependency is an expression"
      ) &&
      /@babel\/standalone\/babel/.test(arg)
    ) {
      return;
    }
  }
  warn(...args);
};

function createModule(exports: AnyObject = {}) {
  return { __esModule: true, ...exports };
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
