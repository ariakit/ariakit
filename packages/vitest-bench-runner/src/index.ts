import * as fs from "node:fs";
import * as path from "node:path";
import type { File, Suite, SuiteHooks, Test } from "@vitest/runner";
import type { FnOptions } from "tinybench";
import { Bench } from "tinybench";
import type { SerializedConfig } from "vitest";
import { VitestTestRunner } from "vitest/runners";
import type { VitestRunner } from "vitest/suite";
import { getFn, getHooks } from "vitest/suite";

export default class VitestBenchRunner
  extends VitestTestRunner
  implements VitestRunner
{
  #bench = new Bench({ throws: true });

  constructor(config: SerializedConfig) {
    if (config.sequence.concurrent) {
      throw new Error(
        "Expected tests to be ran sequentially, not concurrently.",
      );
    }

    super(config);
  }

  // collect tests and add them into
  onBeforeRunFiles(files: Array<File>) {
    const bench = this.#bench;

    for (const file of files) {
      walk(file, {
        onTest(test) {
          const fn = getFn(test);
          const hooks = deriveTinyBenchHooks(test);
          bench.add(test.id, fn, hooks);
        },
      });
    }
  }

  async runTask(test: Test) {
    // safety: tasks added earlier in `onBeforeRunFiles`
    const fn = this.#bench.getTask(test.id)!;
    await fn.run();
  }

  // Format details
  // https://bencher.dev/docs/reference/bencher-metric-format/
  onAfterRunFiles(): void {
    const filename = new Date().toISOString();

    const filepath = path.resolve(this.config.root, ".benchmark", filename);

    const results = this.#bench.tasks.reduce((accu, task) => {
      if (task.result) {
        accu[task.name] = {
          latency: {
            value: task.result.latency.mean,
            lower_value: task.result.latency.min,
            higher_value: task.result.latency.max,
          },
          throughput: {
            value: task.result.throughput.mean,
            lower_value: task.result.throughput.min,
            higher_value: task.result.throughput.max,
          },
        };
      }
      return accu;
    }, {} as BMF);

    const data = JSON.stringify(results, null, 4);

    fs.writeFileSync(filepath, data, { encoding: "utf8" });
  }
}

// the idea
//
// 1. run existing test in bench mode.
// 2. add benchmark results to a file like `.benchmark/<ISO8601>.json` (with some git stuff)
// 3. During build, create benchmark and compare.

function walk(
  suite: Suite,
  callbacks: { onSuite?(suite: Suite): void; onTest?(test: Test): void },
) {
  const buffered: Array<Suite> = [suite];

  // breadth first search
  while (buffered.length >= 0) {
    const suites = buffered.concat();
    buffered.length = 0;

    for (const current of suites)
      for (const task of current.tasks) {
        if (task.type === "suite") {
          buffered.push(task);
          callbacks.onSuite?.(task);
        } else {
          callbacks.onTest?.(task);
        }
      }
  }
}

function deriveTinyBenchHooks(
  test: Test,
): Pick<FnOptions, "afterEach" | "beforeEach"> {
  const hooks: Pick<SuiteHooks, "afterEach" | "beforeEach"> = test.suite
    ? getHooks(test.suite)
    : {
        afterEach: [],
        beforeEach: [],
      };

  // Only call what Vitest doesn't, which is all iterations but the first.
  const once = { before: false, after: false };

  const benched: Pick<FnOptions, "afterEach" | "beforeEach"> = {
    beforeEach() {
      if (once.before) {
        // safety: all tests have suites
        hooks.beforeEach.forEach((fn) => fn(test.context, test.suite!));
      } else {
        once.before = true;
      }
    },
    afterEach() {
      if (once.after) {
        // safety: all tests have suites
        hooks.afterEach.forEach((fn) => fn(test.context, test.suite!));
      } else {
        once.after = true;
      }
    },
  };

  if ((hooks.afterEach?.length ?? 0) === 0) {
    delete benched.afterEach;
  }

  if ((hooks.beforeEach?.length ?? 0) === 0) {
    delete benched.beforeEach;
  }

  return benched;
}

type BMF = Record<
  string,
  Record<
    "latency" | "throughput",
    { value: number; lower_value?: number; higher_value?: number }
  >
>;
