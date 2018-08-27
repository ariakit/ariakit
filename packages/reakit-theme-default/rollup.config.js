import createConfig from "../../rollup.config";
import pkg from "./package.json";

export default [
  createConfig({ pkg, input: "src/index.ts" }),
  createConfig({ pkg, input: "src/index.ts", umd: true })
];
