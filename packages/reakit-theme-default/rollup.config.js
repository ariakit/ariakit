const createConfig = require("../../rollup.config");
const pkg = require("./package.json");

export default [
  createConfig({ pkg, input: "src/index.ts" }),
  createConfig({ pkg, input: "src/index.ts", umd: true })
];
