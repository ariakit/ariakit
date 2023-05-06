import { readFileSync } from "fs";
import { dirname, join } from "path";
import { parseSync, traverse } from "@babel/core";
// @ts-expect-error
import * as presetEnv from "@babel/preset-env";
// @ts-expect-error
import * as presetReact from "@babel/preset-react";
// @ts-expect-error
import * as presetTypescript from "@babel/preset-typescript";
import * as t from "@babel/types";
import { globSync } from "glob";
import { readPackageUpSync } from "read-pkg-up";
import resolveFrom from "resolve-from";
import ts from "typescript";

const host = ts.createCompilerHost({});
let warnedAboutVersion = false;

/**
 * @typedef {{ [file: string]: Record<string, string>, dependencies:
 *  Record<string, string>, devDependencies: Record<string, string> }} Deps
 */

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
  if (!result) return "latest";
  packageCache.set(source, result);
  const { version } = result.packageJson;
  if (!version && !warnedAboutVersion) {
    warnedAboutVersion = true;
    console.log("No version found for", source);
  }
  return version || "latest";
}

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
      : resolveFrom.silent(dirname(filename), source);

  const result = { resolvedSource, external };

  if (resolvedSource && external) {
    if (deps.dependencies[source]) return result;
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

  if (deps[filename]) return deps;
  deps[filename] = {};

  const content = readFileSync(filename, "utf8");
  const parsed = parseSync(content, {
    filename,
    presets: [
      presetEnv.default,
      presetTypescript.default,
      [presetReact.default, { runtime: "automatic" }],
    ],
  });

  assignExternal(deps, "react", filename);
  assignExternal(deps, "react-dom", filename);

  const isAppDir = /\/app\/.*\/page\.[mc]?[tj]sx?$/.test(filename);

  if (isAppDir) {
    const dir = dirname(filename);
    const files = globSync("**/{page,default,layout,loading}.{js,jsx,ts,tsx}", {
      cwd: dir,
      dotRelative: true,
      ignore: Object.keys(deps),
    });

    files.forEach((file) => {
      getExampleDeps(join(dir, file), deps);
    });
  }

  traverse(parsed, {
    enter(nodePath) {
      const source = getSourceValue(nodePath);

      if (!source) return;

      const resolved = assignExternal(deps, source, filename);
      const { resolvedSource, external } = resolved;

      if (external || !resolvedSource) return;

      if (!deps[filename]?.[source]) {
        deps[filename] = { ...deps[filename], [source]: resolvedSource };
        getExampleDeps(resolvedSource, deps);
      }
    },
  });

  return deps;
}
