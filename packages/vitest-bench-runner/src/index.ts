import * as fs from "node:fs";
import * as path from "node:path";
import type { File, Suite, SuiteHooks, Task, Test } from "@vitest/runner";
import type { FnOptions } from "tinybench";
import { VitestTestRunner } from "vitest/runners";
import type { VitestRunner } from "vitest/suite";
import { getFn, getHooks } from "vitest/suite";

type Delegated<T> = Promise<T> & {
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
};

function delegated<T>(promisable?: PromiseLike<T>): Delegated<T> {
  let resolve: undefined | ((value: T | PromiseLike<T>) => void);
  let reject: undefined | ((reason?: any) => void);

  const promise = new Promise<T>((res, rej) => {
    // resolve = (...args) => setTimeout(() => res(...args), 0);
    // reject = (...args) => setTimeout(() => rej(...args), 0);

    resolve = res;
    reject = rej;

    if (promisable) {
      try {
        promisable.then(res);
      } catch (reason) {
        rej(reason);
      }
    }
  });

  if (resolve === undefined || reject === undefined) {
    throw new Error(`Expected resolve and reject to be assigned`);
  }

  return Object.assign(promise, { resolve, reject });
}

// todo: remove assertions?
export default class VitestBenchRunner
  extends VitestTestRunner
  implements VitestRunner
{
  #bench = import("tinybench").then(
    (tinybench) => new tinybench.Bench({ throws: true }),
  );
  #taskIdToTaskName = new Map<string, string>();
  #onBeforeRunFilesPromise: Delegated<void> = delegated();

  // collect tests and add them into
  async onBeforeRunFiles(files: Array<File>) {
    const bench = await this.#bench;
    const map = this.#taskIdToTaskName;

    for (const file of files) {
      walk(file, {
        onTest(test) {
          const fn = getFn(test);
          const hooks = deriveTinyBenchHooks(test);
          bench.add(test.id, fn, hooks);

          const name = getFullName(test);
          map.set(test.id, name);
        },
      });
    }

    this.#onBeforeRunFilesPromise.resolve();
  }

  async runTask(test: Test) {
    await this.#onBeforeRunFilesPromise;
    const bench = await this.#bench;

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
        console.warn(`Expected to find result for task ${task.name}`);
      }
      return accu;
    }, {} as BMF);

    const data = JSON.stringify(results, null, 4);

    fs.mkdirSync(path.dirname(filepath), { recursive: true });
    fs.writeFileSync(filepath, data, { encoding: "utf8" });
  }
}

function walk(
  suite: Suite,
  callbacks: { onSuite?(suite: Suite): void; onTest?(test: Test): void },
) {
  const buffered: Array<Suite> = [suite];

  // breadth first search
  while (buffered.length > 0) {
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
    async beforeEach() {
      if (once.before) {
        for (const fn of hooks.beforeEach) {
          // safety: all tests have suites
          await fn(test.context, test.suite!);
        }
      } else {
        once.before = true;
      }
    },
    async afterEach() {
      if (once.after) {
        for (const fn of hooks.afterEach) {
          // safety: all tests have suites
          await fn(test.context, test.suite!);
        }
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

function getFullName(task: Task): string {
  const names = [task.name];
  while (task.suite) {
    names.unshift(task.suite.name);
    task = task.suite;
  }
  // this task is the project
  names.unshift(task.file.name, task.file.projectName ?? "");
  return names.filter(Boolean).join("=>");
}
