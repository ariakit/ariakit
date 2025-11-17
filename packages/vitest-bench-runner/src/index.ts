import * as fs from "node:fs";
import * as path from "node:path";
import type { File, Test } from "@vitest/runner";
import {} from "@vitest/runner";
import { VitestTestRunner } from "vitest/runners";
import type { VitestRunner } from "vitest/suite";
import { getFn } from "vitest/suite";
import { Delegated } from "./delegated.ts";
import { deriveTinyBenchHooks } from "./tinybench.ts";
import { deriveBenchmarkableTests, getFullName } from "./vitest.ts";

let count = 0;
// todo: IS THE ENVIRONMENT for JSDOM COOKED?!
//
// Not a race condition between tests.
// surely not a bug in the test query?
//
// todo: remove assertions via vite plugin?
export default class VitestBenchRunner
  extends VitestTestRunner
  implements VitestRunner
{
  #bench = import("tinybench").then(
    (tinybench) => new tinybench.Bench({ throws: true }),
  );
  #taskIdToTaskName = new Map<string, string>();
  #onBeforeRunFilesPromise = new Delegated();

  // collect tests and add them into tinybench
  async onBeforeRunFiles(files: Array<File>) {
    const bench = await this.#bench;

    for (const file of files) {
      const benchmarkable = deriveBenchmarkableTests(file);

      // add benchmark task
      for (const test of benchmarkable) {
        const fn = getFn(test);
        const hooks = deriveTinyBenchHooks(test);
        bench.add(test.id, fn, hooks);

        const name = getFullName(test);
        this.#taskIdToTaskName.set(test.id, name);
      }
    }

    this.#onBeforeRunFilesPromise.resolve();
  }

  async runTask(test: Test) {
    await this.#onBeforeRunFilesPromise;
    const bench = await this.#bench;

    console.log("Run task", count++);

    // safety: tasks added earlier in `onBeforeRunFiles`
    const fn = bench.getTask(test.id)!;
    await fn.run();
  }

  // Format details
  // https://bencher.dev/docs/reference/bencher-metric-format/
  async onAfterRunFiles() {
    const bench = await this.#bench;

    const filename = new Date().toISOString();
    const filepath = path.resolve(this.config.root, ".benchmark", filename);

    const results = bench.tasks.reduce((accu, task) => {
      // buffer the getter call
      const result = task.result;
      if (result) {
        const name = this.#taskIdToTaskName.get(task.name)!;
        accu[name] = {
          latency: {
            value: result.latency?.mean,
            lower_value: result.latency?.min,
            higher_value: result.latency?.max,
          },
          throughput: {
            value: result.throughput?.mean,
            lower_value: result.throughput?.min,
            higher_value: result.throughput?.max,
          },
        };
      } else {
        // todo: not console log or find safe console log
        console.warn(`Expected to find result for task ${task.name}`);
      }
      return accu;
    }, {} as BMF);

    const data = JSON.stringify(results, null, 4);

    fs.mkdirSync(path.dirname(filepath), { recursive: true });
    fs.writeFileSync(filepath, data, { encoding: "utf8" });

    super.onAfterRunFiles();
  }
}

type BMF = Record<
  string,
  Record<
    "latency" | "throughput",
    { value: number; lower_value?: number; higher_value?: number }
  >
>;
