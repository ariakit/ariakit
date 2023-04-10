import { readFileSync } from "fs";
import { dirname } from "path";
import { parseSync, traverse } from "@babel/core";
import * as t from "@babel/types";
import { readPackageUpSync } from "read-pkg-up";
import resolveFrom from "resolve-from";
import ts from "typescript";

const host = ts.createCompilerHost({});

/**
 * @typedef {{ [file: string]: Record<string, string>, dependencies:
 *  Record<string, string>, devDependencies: Record<string, string> }} Deps
 */

/**
 * @param {Deps} deps
 * @param {string} source
 * @param {string} filename
 */
function assignExternal(deps, source, filename) {
  const { resolvedModule } = ts.resolveModuleName(source, filename, {}, host);
  const external =
    resolvedModule?.isExternalLibraryImport ?? !source.startsWith(".");

  const resolvedSource =
    resolvedModule?.resolvedFileName && !resolvedModule.isExternalLibraryImport
      ? resolvedModule.resolvedFileName
      : resolveFrom(dirname(filename), source);

  const result = { resolvedSource, external };

  if (external) {
    const version = getPackageVersion(resolvedSource);
    deps.dependencies[source] = version;

    const resolvedFilename = resolvedModule?.resolvedFileName;
    if (!resolvedFilename) return result;
    if (!resolvedFilename.includes("node_modules/@types/")) return result;
    const typePkgName = getPackageName(resolvedFilename);
    if (!typePkgName) return result;

    deps.devDependencies[typePkgName] = getPackageVersion(resolvedFilename);
  }

  return result;
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

/** @type {Map<string, import("read-pkg-up").NormalizedReadResult>}} */
const packageCache = new Map();

/** @param {string} source */
function getPackageName(source) {
  const result = packageCache.get(source) || readPackageUpSync({ cwd: source });
  if (!result) return null;
  packageCache.set(source, result);
  return result.packageJson.name;
}

/** @param {string} source */
function getPackageVersion(source) {
  const result = packageCache.get(source) || readPackageUpSync({ cwd: source });
  if (!result) return "*";
  packageCache.set(source, result);
  return result.packageJson.version;
}

/**
 * @param {string} filename
 * @param {{ [file: string]: Record<string, string>, dependencies:
 * Record<string, string>, devDependencies: Record<string, string>, }} deps
 */
export function getExampleDeps(
  filename,
  deps = { dependencies: {}, devDependencies: {} }
) {
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

  assignExternal(deps, "react", filename);
  assignExternal(deps, "react-dom", filename);

  if (!deps[filename]) {
    deps[filename] = {};
  }

  traverse(parsed, {
    enter(nodePath) {
      const source = getSourceValue(nodePath);

      if (!source) return;

      const resolved = assignExternal(deps, source, filename);
      const { resolvedSource, external } = resolved;

      if (external) return;

      if (!deps[filename]?.[source]) {
        deps[filename] = { ...deps[filename], [source]: resolvedSource };
        getExampleDeps(resolvedSource, deps);
      }
    },
  });

  return deps;
}
