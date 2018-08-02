import { lstatSync, readdirSync, existsSync } from "fs";
import { join } from "path";
import babel from "rollup-plugin-babel";
import resolve from "rollup-plugin-node-resolve";
import replace from "rollup-plugin-replace";
import commonjs from "rollup-plugin-commonjs";
import filesize from "rollup-plugin-filesize";
import { uglify } from "rollup-plugin-uglify";
import ignore from "rollup-plugin-ignore";
import pkg from "./package.json";

const external = [...Object.keys(pkg.peerDependencies), "prop-types"];
const allExternal = [...external, ...Object.keys(pkg.dependencies)];

const componentsDir = "./src/components";
const components = readdirSync(componentsDir)
  .filter(x => x !== "index.js")
  .map(x => join(componentsDir, x));

const enhancersDir = "./src/enhancers";
const enhancers = readdirSync(enhancersDir)
  .filter(x => x !== "__tests__")
  .map(x => join(enhancersDir, x));

const multiple = [...components, ...enhancers];

// Keep lodash/foo as external too
const makeExternalPredicate = externalArr => {
  if (!externalArr.length) {
    return () => false;
  }
  const pattern = new RegExp(`^(${externalArr.join("|")})($|/)`);
  return id => pattern.test(id);
};

const useLodashEs = () => ({
  visitor: {
    ImportDeclaration(path) {
      const { source } = path.node;
      source.value = source.value.replace(/^lodash($|\/)/, "lodash-es$1");
    }
  }
});

const isDirectory = source => lstatSync(source).isDirectory();

const inputAsDir = () => ({
  name: "inputAsDir",
  resolveId: importee =>
    existsSync(importee) && isDirectory(importee)
      ? join(importee, "index.js")
      : null
});

const createCommonPlugins = es => [
  babel({
    exclude: "node_modules/**",
    plugins: [
      "styled-components",
      "external-helpers",
      es && useLodashEs
    ].filter(Boolean)
  }),
  commonjs({
    include: /node_modules/,
    ignoreGlobal: true,
    namedExports: {
      "react-is": ["isValidElementType"]
    }
  }),
  filesize(),
  inputAsDir()
];

const multipleEs = {
  experimentalCodeSplitting: true,
  input: multiple,
  external: makeExternalPredicate(allExternal),
  plugins: [...createCommonPlugins(true), resolve()],
  output: {
    format: "es",
    dir: "es"
  }
};

const multipleCjs = {
  experimentalCodeSplitting: true,
  input: multiple,
  external: makeExternalPredicate(allExternal),
  plugins: [...createCommonPlugins(), resolve()],
  output: {
    format: "cjs",
    dir: "lib"
  }
};

const es = {
  input: "src/index.js",
  external: makeExternalPredicate(allExternal),
  plugins: [...createCommonPlugins(true), resolve()],
  output: {
    file: pkg.module,
    format: "es"
  }
};

const cjs = {
  input: "src/index.js",
  external: makeExternalPredicate(allExternal),
  plugins: [...createCommonPlugins(), resolve()],
  output: {
    name: pkg.name,
    file: pkg.main,
    format: "cjs",
    exports: "named"
  }
};

const umd = {
  input: "src/index.js",
  external: makeExternalPredicate(external),
  output: {
    name: pkg.name,
    file: pkg.browser,
    format: "umd",
    exports: "named",
    globals: {
      react: "React",
      "react-dom": "ReactDOM",
      "prop-types": "PropTypes"
    }
  },
  plugins: [
    ...createCommonPlugins(),
    ignore(["stream"]),
    uglify(),
    replace({
      "process.env.NODE_ENV": JSON.stringify("production")
    }),
    resolve({
      preferBuiltins: false
    })
  ]
};

export default [multipleEs, multipleCjs, es, cjs, umd];
