import { defineCloudflareConfig } from "@opennextjs/cloudflare/config";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";

export default {
  ...defineCloudflareConfig({
    incrementalCache: r2IncrementalCache,
  }),
  // The package's build script runs OpenNext, so do not invoke it recursively.
  buildCommand: "pnpm exec next build",
};
