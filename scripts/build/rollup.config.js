// @ts-check
import { babel } from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import { camelCase, upperFirst } from "lodash";
import { terser } from "rollup-plugin-terser";

const {
  getIndexPath,
  getMainDir,
  getModuleDir,
  getPackage,
  getPublicFiles,
  getSourcePath,
} = require("./utils");

const cwd = process.cwd();
const pkg = getPackage(cwd);
const sourcePath = getSourcePath(cwd);
const extensions = [".ts", ".tsx", ".js", ".jsx", ".json"];

// Keeps subdirectories and files belonging to our dependencies as external too
// (i.e. lodash/pick)
function makeExternalPredicate(externalArr) {
  if (!externalArr.length) {
    return () => false;
  }
  const pattern = new RegExp(`^(${externalArr.join("|")})($|/)`);
  return (id) => pattern.test(id);
}

function getExternal(isUMD) {
  const external = Object.keys(pkg.peerDependencies || {});
  const allExternal = [...external, ...Object.keys(pkg.dependencies || {})];
  return isUMD ? external : makeExternalPredicate(allExternal);
}

function getPlugins(isUMD) {
  const commonPlugins = [
    babel({
      extensions,
      babelHelpers: "bundled",
      exclude: ["node_modules/**", "../../node_modules/**"],
    }),
    nodeResolve({ extensions, preferBuiltins: false }),
  ];

  if (isUMD) {
    return [
      ...commonPlugins,
      commonjs({ include: /node_modules/ }),
      terser(),
      replace({
        preventAssignment: true,
        "process.env.NODE_ENV": JSON.stringify("production"),
      }),
    ];
  }

  return commonPlugins;
}

function getOutput(isUMD) {
  if (isUMD) {
    return {
      name: upperFirst(camelCase(pkg.name)),
      file: pkg.unpkg,
      format: "umd",
      exports: "named",
      globals: {
        ariakit: "Ariakit",
        react: "React",
        "react-dom": "ReactDOM",
        "@testing-library/react": "TestingLibraryReact",
        "@testing-library/dom": "TestingLibraryDom",
      },
    };
  }

  const moduleDir = getModuleDir(cwd);

  return [
    moduleDir && {
      format: "es",
      dir: moduleDir,
    },
    {
      format: "cjs",
      dir: getMainDir(cwd),
      exports: "named",
    },
  ].filter(Boolean);
}

function getInput(isUMD) {
  if (isUMD) {
    return getIndexPath(sourcePath);
  }
  return getPublicFiles(sourcePath);
}

function getConfig(isUMD) {
  return {
    external: getExternal(isUMD),
    plugins: getPlugins(isUMD),
    output: getOutput(isUMD),
    input: getInput(isUMD),
  };
}

module.exports = [
  getConfig(),
  pkg.unpkg && !process.env.NO_UMD && getConfig(true),
].filter(Boolean);
