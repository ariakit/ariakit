import reactPlugin from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // The React benchmarks (such as the dialog one) import the React package
  // sources, whose JSX needs the automatic runtime transform.
  plugins: [reactPlugin()],
  test: {
    environment: "node",
    watch: false,
    benchmark: {
      include: ["packages/*/benchmark/*.bench.ts"],
    },
  },
});
