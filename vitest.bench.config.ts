import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    watch: false,
    benchmark: {
      include: ["packages/*/benchmark/*.bench.ts"],
    },
  },
});
