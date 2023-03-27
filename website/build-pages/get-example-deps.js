// @ts-check
import { readFileSync } from "fs";
import { dirname } from "path";
import { parseSync, traverse } from "@babel/core";
import * as t from "@babel/types";
import { readPackageUpSync } from "read-pkg-up";
import resolveFrom from "resolve-from";
import ts from "typescript";

const host = ts.createCompilerHost({});

/**
 * @param {string} source
 * @param {string} filename
 */
function resolveModule(source, filename) {
  const res = ts.resolveModuleName(source, filename, {}, host);
  if (res.resolvedModule && !res.resolvedModule.isExternalLibraryImport) {
    return res.resolvedModule.resolvedFileName;
  }
  return resolveFrom(dirname(filename), source);
}

/** @param {import("@babel/core").NodePath<t.Node>} nodePath */
function getSourceValue(nodePath) {
  // import("source")
  if (nodePath.isCallExpression()) {
    if (!nodePath.get("callee").isImport()) return;
    const [source] = nodePath.get("arguments");
    if (!source?.isStringLiteral()) return;
    return source.node.value;
  }
  // import "source" and export * from "source"
  const source = nodePath.get("source");
  if (Array.isArray(source)) return;
  if (!source.isStringLiteral()) return;
  return source.node.value;
}

/** @type {Record<string, string | undefined>} */
const versionsCache = {};

/** @param {string} source */
function getPackageVersion(source) {
  if (versionsCache[source]) return versionsCache[source];
  const result = readPackageUpSync({ cwd: source });
  versionsCache[source] = result?.packageJson.version;
  return result?.packageJson.version;
}

/**
 * @param {string} filename
 * @param {{ dependencies: Record<string, string>, [file: string]:
 * Record<string, string> }} deps
 */
export function getExampleDeps(filename, deps = { dependencies: {} }) {
  if (!/\.[tj]sx?$/.test(filename)) return deps;
  const content = readFileSync(filename, "utf8");
  const parsed = parseSync(content, {
    filename,
    presets: [
      "@babel/preset-env",
      "@babel/preset-typescript",
      ["@babel/preset-react", { runtime: "automatic" }],
    ],
  });

  if (!deps[filename]) {
    deps[filename] = {};
  }

  traverse(parsed, {
    enter(nodePath) {
      const source = getSourceValue(nodePath);

      if (!source) return;

      const resolvedSource = resolveModule(source, filename);
      const external = !source.startsWith(".");

      if (external) {
        const version = getPackageVersion(resolvedSource) || "latest";
        deps.dependencies[source] = version;
        return;
      }

      if (!deps[filename]?.[source]) {
        deps[filename] = { ...deps[filename], [source]: resolvedSource };
        getExampleDeps(resolvedSource, deps);
      }
    },
  });

  return deps;
}
