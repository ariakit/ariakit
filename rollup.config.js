import babel from "rollup-plugin-babel";
import resolve from "rollup-plugin-node-resolve";
import replace from "rollup-plugin-replace";
import commonjs from "rollup-plugin-commonjs";
import { uglify } from "rollup-plugin-uglify";
import ignore from "rollup-plugin-ignore";

const extensions = [".ts", ".tsx", ".js", ".jsx", ".json"];

const makeExternalPredicate = externalArr => {
  if (!externalArr.length) {
    return () => false;
  }
  const pattern = new RegExp(`^(${externalArr.join("|")})($|/)`);
  return id => pattern.test(id);
};

const getExternal = (umd, pkg) => {
  const external = [...Object.keys(pkg.peerDependencies), "prop-types"];
  const allExternal = [...external, ...Object.keys(pkg.dependencies)];
  return makeExternalPredicate(umd ? allExternal : external);
};

const commonPlugins = [
  babel({
    exclude: ["node_modules/**", "../../node_modules/**"]
  }),
  resolve({ extensions, preferBuiltins: false })
];

const getPlugins = umd =>
  umd
    ? [
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
        })
      ]
    : commonPlugins;

const getOutput = (umd, pkg) =>
  umd
    ? {
        name: pkg.name,
        file: pkg.unpkg,
        format: "umd",
        exports: "named",
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "prop-types": "PropTypes"
        }
      }
    : [
        {
          file: pkg.main,
          format: "cjs",
          exports: "named"
        },
        {
          file: pkg.module,
          format: "es"
        }
      ];

const createConfig = ({ umd, pkg, plugins, ...config }) => ({
  external: getExternal(umd, pkg),
  plugins: [...getPlugins(umd), ...plugins],
  output: getOutput(umd, pkg),
  ...config
});

export default createConfig;
