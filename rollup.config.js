const { existsSync } = require("fs");
const { join } = require("path");
const babel = require("rollup-plugin-babel");
const resolve = require("rollup-plugin-node-resolve");
const replace = require("rollup-plugin-replace");
const commonjs = require("rollup-plugin-commonjs");
const filesize = require("rollup-plugin-filesize");
const { uglify } = require("rollup-plugin-uglify");
const ignore = require("rollup-plugin-ignore");
const pkg = require("./package.json");
const publicFiles = require("./scripts/publicFiles");

const external = [...Object.keys(pkg.peerDependencies), "prop-types"];
const allExternal = [...external, ...Object.keys(pkg.dependencies)];

const multipleInput = Object.values(publicFiles).map(file =>
  file.replace(/\/index.js$/, "")
);

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

const inputAsDir = () => ({
  name: "inputAsDir",
  resolveId: path => {
    const dir = join(path, "index.js");
    return existsSync(dir) ? dir : null;
  }
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
  input: multipleInput,
  external: makeExternalPredicate(allExternal),
  plugins: [...createCommonPlugins(true), resolve()],
  output: {
    format: "es",
    dir: "es"
  }
};

const multipleCjs = {
  experimentalCodeSplitting: true,
  input: multipleInput,
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
