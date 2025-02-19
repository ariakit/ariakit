import { bench, type BenchFunction } from "vitest";
import { LOADER, LOADERS } from "../vitest.setup.ts";
import path from "node:path";

/**
 * @summary
 * Loads a benchmark
 *
 * @description
 * The Vitest `bench` API is experimental as of `vitest@^3`.
 *
 * Drawbacks.
 * 1. `{before,after}{All,Each}` hooks do not work,
 * 2. Does not throw error from benchmark by default.
 */
export function createBenchmarker(
  dirname: string,
  lifecycle?: () => () => void,
) {
  return function benchmark(name: string | Function, fn: BenchFunction) {
    const cleanups: Array<() => void> = [];

    return bench(name, fn, {
      // remove false positives
      throws: true,
      async setup() {
        const unload = await LOADERS[LOADER](path.basename(dirname));

        if (unload === false) {
          throw new Error(`Expected to import the benchmark example`);
        }

        cleanups.push(unload);

        lifecycle && cleanups.push(lifecycle());
      },
      async teardown() {
        cleanups.reverse().forEach((cleanup) => cleanup());
        cleanups.length = 0;
      },
    });
  };
}
