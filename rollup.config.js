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

const createCommonPlugins = es => [
  babel({
    exclude: "node_modules/**",
    plugins: [
      "styled-components",
      "external-helpers",
      es && useLodashEs
    ].filter(Boolean)
  }),
  filesize()
];

const es = {
  experimentalCodeSplitting: true,
  input: {
    index: "src/index.js",
    ...publicFiles
  },
  external: makeExternalPredicate(allExternal),
  plugins: [...createCommonPlugins(true), resolve()],
  output: {
    format: "es",
    dir: "es"
  }
};

const cjs = {
  experimentalCodeSplitting: true,
  input: {
    index: "src/index.js",
    ...publicFiles
  },
  external: makeExternalPredicate(allExternal),
  plugins: [...createCommonPlugins(), resolve()],
  output: {
    format: "cjs",
    dir: "lib",
    exports: "named"
  }
};

const umd = {
  input: "src/index.js",
  external: makeExternalPredicate(external),
  output: {
    name: pkg.name,
    file: pkg.unpkg,
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
    commonjs({
      include: "node_modules/**",
      namedExports: {
        "react-is": ["isValidElementType"]
      }
    }),
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

export default [es, cjs, umd];
