// @ts-check
import { readFileSync } from "fs";
import { dirname, extname, join, resolve } from "path";
import { parseSync, traverse } from "@babel/core";
import * as t from "@babel/types";
import { resolve as metaResolve } from "import-meta-resolve";
import { readPackageUpSync } from "read-pkg-up";
import resolveFrom from "resolve-from";
import ts from "typescript";
import babelConfig from "../../babel.config.js";

const baseUrl = join(process.cwd(), "../..");
const tsconfigPath = join(baseUrl, "tsconfig.json");
const tsconfig = JSON.parse(readFileSync(tsconfigPath, "utf8"));
const options = { baseUrl, ...tsconfig.compilerOptions };
const host = ts.createCompilerHost(options);

/**
 * @param {string} source
 * @param {string} filename
 */
async function resolveModule(source, filename) {
  const res = ts.resolveModuleName(source, filename, options, host);
  if (res.resolvedModule && !res.resolvedModule.isExternalLibraryImport) {
    return res.resolvedModule.resolvedFileName;
  }
  return resolveFrom(dirname(filename), source);
  // const extension = extname(source);
  // if (extension && !/^\.m?[jt]sx?$/.test(extension)) {
  //   return resolve(dirname(filename), source);
  // }
  // return metaResolve(source, `file://${filename}`);
  // return moduleResolve(source, new URL(`file://${filename}`)).pathname;
  // return resolveFrom(dirname(filename), source);
}

/**
 *
 * @param {import("@babel/core").NodePath<t.Node>} nodePath
 */
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

/**
 * @type {Record<string, string | undefined>}
 */
const versionsCache = {};

/**
 * @param {string} source
 */
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
export async function parseDeps(filename, deps = { dependencies: {} }) {
  if (!/\.[tj]sx?$/.test(filename)) return deps;
  const content = readFileSync(filename, "utf8");
  const parsed = parseSync(content, { filename, ...babelConfig });

  if (!deps[filename]) {
    deps[filename] = {};
  }

  /** @type {string[]} */
  const sources = [];
  /** @type {Promise<string | undefined>[]} */
  const promises = [];

  traverse(parsed, {
    enter(nodePath) {
      const source = getSourceValue(nodePath);

      if (!source) return;

      sources.push(source);
      promises.push(resolveModule(source, filename));
    },
  });
  try {
    const resolvedSources = await Promise.all(promises);

    resolvedSources.forEach((resolvedSource, i) => {
      if (!resolvedSource) return;
      const source = sources[i];
      if (!source) return;
      const external = !source.startsWith(".");

      if (external) {
        const version = getPackageVersion(resolvedSource) || "latest";
        deps.dependencies[source] = version;
        return;
      }

      if (!deps[filename]?.[source]) {
        deps[filename] = { ...deps[filename], [source]: resolvedSource };
        parseDeps(resolvedSource, deps);
      }
    });
  } catch (e) {
    console.log(e);
  }

  return deps;
}
