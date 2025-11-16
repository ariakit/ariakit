import type { SuiteHooks, Test } from "@vitest/runner";
import { getHooks } from "@vitest/runner";
import type { FnOptions } from "tinybench";
import { skip } from "./utils.ts";

export function deriveTinyBenchHooks(
  test: Test,
): Pick<FnOptions, "afterEach" | "beforeEach"> {
  const hooks: Pick<SuiteHooks, "afterEach" | "beforeEach"> = test.suite
    ? getHooks(test.suite)
    : {
        afterEach: [],
        beforeEach: [],
      };

  async function beforeEach() {
    for (const fn of hooks.beforeEach) {
      // safety: all tests have suites
      await fn(test.context, test.suite!);
    }
  }

  async function afterEach() {
    for (const fn of hooks.afterEach) {
      // safety: all tests have suites
      await fn(test.context, test.suite!);
    }
  }

  // Only call what Vitest doesn't, which is all iterations but the first.
  const benched: Pick<FnOptions, "afterEach" | "beforeEach"> = {
    beforeEach: skip(beforeEach, 1),
    afterEach: skip(afterEach, 1),
  };

  return benched;
}
