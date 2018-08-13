const babel = require("rollup-plugin-babel");
const resolve = require("rollup-plugin-node-resolve");
const replace = require("rollup-plugin-replace");
const commonjs = require("rollup-plugin-commonjs");
const { uglify } = require("rollup-plugin-uglify");
const ignore = require("rollup-plugin-ignore");
const pkg = require("./package.json");
const publicFiles = require("./scripts/publicFiles");

const external = [...Object.keys(pkg.peerDependencies), "prop-types"];
const allExternal = [...external, ...Object.keys(pkg.dependencies)];
const extensions = [".ts", ".tsx", ".js", ".jsx", ".json"];

const makeExternalPredicate = externalArr => {
  if (!externalArr.length) {
    return () => false;
  }
  const pattern = new RegExp(`^(${externalArr.join("|")})($|/)`);
  return id => pattern.test(id);
};

const commonPlugins = [
  babel({
    exclude: ["node_modules/**", "../../node_modules/**"]
  })
];

const main = {
  experimentalCodeSplitting: true,
  input: publicFiles,
  external: makeExternalPredicate(allExternal),
  plugins: [...commonPlugins, resolve({ extensions })],
  output: [
    {
      format: "es",
      dir: "es"
    },
    {
      format: "cjs",
      dir: "lib",
      exports: "named"
    }
  ]
};

const umd = {
  input: "src/index.ts",
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
    ...commonPlugins,
    commonjs({
      include: /node_modules/,
      namedExports: {
        "../../node_modules/react-is/index.js": ["isValidElementType"]
      }
    }),
    ignore(["stream"]),
    uglify(),
    replace({
      "process.env.NODE_ENV": JSON.stringify("production")
    }),
    resolve({
      extensions,
      preferBuiltins: false
    })
  ]
};

export default [main, umd];
