const createConfig = require("../../rollup.config");
const publicFiles = require("./scripts/publicFiles");
const pkg = require("./package.json");

export default [
  createConfig({
    pkg,
    experimentalCodeSplitting: true,
    input: publicFiles,
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
  }),
  createConfig({ pkg, input: "src/index.ts", umd: true })
];
