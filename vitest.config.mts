import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    deps: {
      registerNodeLoader: true,
    },
    include: ["examples/button/test.tsx"],
    environment: "jsdom",
  },
});
