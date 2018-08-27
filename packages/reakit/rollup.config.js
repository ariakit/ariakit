import createConfig from "../../rollup.config";
import publicFiles from "./scripts/publicFiles";
import pkg from "./package.json";

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
