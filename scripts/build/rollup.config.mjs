// @ts-check
import { babel } from "@rollup/plugin-babel";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "rollup-plugin-typescript2";
import {
  getMainDir,
  getModuleDir,
  getPackage,
  getPublicFiles,
  getSourcePath,
} from "./utils.js";

const cwd = process.cwd();
const pkg = getPackage(cwd);
const sourcePath = getSourcePath(cwd);
const extensions = [".ts", ".tsx", ".js", ".jsx", ".json"];

/**
 * Keeps subdirectories and files belonging to our dependencies as external too
 * (i.e. lodash/pick)
 * @param {string[]} externalArr
 */
function makeExternalPredicate(externalArr) {
  if (!externalArr.length) {
    return () => false;
  }
  const pattern = new RegExp(`^(${externalArr.join("|")})($|/)`);
  /** @param {string} id */
  return (id) => pattern.test(id);
}

function getExternal() {
  const external = Object.keys(pkg.peerDependencies || {});
  const allExternal = [...external, ...Object.keys(pkg.dependencies || {})];
  return makeExternalPredicate(allExternal);
}

function getPlugins() {
  return [
    typescript(),
    babel({
      extensions,
      babelHelpers: "bundled",
      exclude: ["node_modules/**", "../../node_modules/**"],
    }),
    nodeResolve({ extensions, preferBuiltins: false }),
  ];
}

/**
 * @returns {import("rollup").OutputOptions | import("rollup").OutputOptions[]}
 */
function getOutput() {
  /** @type {import("rollup").OutputOptions} */
  const mainOutput = {
    format: "cjs",
    dir: getMainDir(cwd),
    exports: "named",
    hoistTransitiveImports: false,
  };
  const moduleDir = getModuleDir(cwd);
  if (moduleDir) {
    return [
      mainOutput,
      { format: "es", dir: moduleDir, hoistTransitiveImports: false },
    ];
  }
  return mainOutput;
}

function getInput() {
  return getPublicFiles(sourcePath);
}

/**
 * @returns {import("rollup").RollupOptions}
 */
function getConfig() {
  return {
    external: getExternal(),
    plugins: getPlugins(),
    output: getOutput(),
    input: getInput(),
  };
}

const config = getConfig();

export default config;
