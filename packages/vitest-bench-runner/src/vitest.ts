import type { Suite, Task, Test } from "@vitest/runner";

/**
 * @summary
 * Walk a Vitest `Suite` and trigger callbacks for tests and suites
 * using breadth first search.
 */
export function bfs(
  suite: Suite,
  callbacks: { onSuite?(suite: Suite): void; onTest?(test: Test): void },
) {
  const buffered: Array<Suite> = [suite];

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

/**
 * @summary
 * Filter out skippable tests and keep `only` tests if applicable.
 */
export function deriveBenchmarkableTests(suite: Suite) {
  const rest: Array<Test> = [];
  const only: Array<Test> = [];

  bfs(suite, {
    onTest(test) {
      switch (test.mode) {
        case "skip":
        case "todo":
          break;

        case "only":
          only.push(test);
          break;

        case "queued":
        case "run":
          rest.push(test);
          break;
      }
    },
  });

  return only.length > 0 ? only : rest;
}

export function getFullName(task: Task): string {
  const names = [task.name];
  while (task.suite) {
    names.unshift(task.suite.name);
    task = task.suite;
  }
  // this task is the project
  names.unshift(task.file.name, task.file.projectName ?? "");
  return names.filter(Boolean).join("=>");
}
