import { readFileSync } from "fs";
import { dirname, resolve } from "path";
import { parseSync, traverse } from "@babel/core";
import * as t from "@babel/types";
import babelConfig from "babel.config";
import resolveFrom from "resolve-from";
import tsconfig from "tsconfig.json";
import { createCompilerHost, resolveModuleName } from "typescript";

const baseUrl = resolve(process.cwd(), "../..");
const options = { ...tsconfig.compilerOptions, baseUrl };
const host = createCompilerHost(options);

function resolveModule(source: string, filename: string) {
  const res = resolveModuleName(source, filename, options, host);
  if (res.resolvedModule) {
    return res.resolvedModule.resolvedFileName;
  }
  return resolveFrom(dirname(filename), source);
}

export function parsePageDeps(
  filename: string,
  deps: Record<"external" | "internal" | "css", Record<string, string>> = {
    external: {},
    internal: {},
    css: {},
  }
) {
  const content = readFileSync(filename, "utf8");
  const parsed = parseSync(content, { filename, ...babelConfig });

  traverse(parsed, {
    enter(nodePath) {
      const isImportDeclaration = nodePath.isImportDeclaration();
      const isExportDeclaration = nodePath.isExportDeclaration();
      const isCallExpression = nodePath.isCallExpression();
      const isValidExpression =
        isImportDeclaration || isExportDeclaration || isCallExpression;
      if (!isValidExpression) return;

      // @ts-expect-error
      if (isExportDeclaration && !nodePath.node.source) return;
      if (isCallExpression && !t.isImport(nodePath.node.callee)) return;

      const originalSource: string = isCallExpression
        ? // @ts-expect-error
          nodePath.node.arguments[0].value
        : // @ts-expect-error
          nodePath.node.source.value;

      const resolvedFilename = resolveModule(originalSource, filename);
      const external = !originalSource.startsWith(".");

      if (external) {
        deps.external[originalSource] = originalSource;
        return;
      }

      if (/\.s?css$/.test(resolvedFilename)) {
        deps.css[originalSource] = resolvedFilename;
        return;
      }

      const source = external ? originalSource : resolvedFilename;

      if (!deps.internal[originalSource]) {
        deps.internal[originalSource] = source;
        if (!external) {
          parsePageDeps(resolvedFilename, deps);
        }
      }
    },
  });

  return deps;
}
