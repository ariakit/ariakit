import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    watch: false,
    benchmark: {
      include: ["packages/ariakit-store/benchmark/*.bench.ts"],
    },
  },
});
