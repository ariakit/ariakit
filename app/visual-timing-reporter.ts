// Experiment: aggregates the time of every Playwright step in the visual job by
// phase. A phase is the nearest `phase:<name>` test step, hook, or fixture
// around a step. API calls and assertions count once at their outermost level.
// Phase totals are self time: a nested phase moves its time out of its parent,
// so the phases of a test add up to the time of its top-level steps. That time
// can exceed the test duration, which leaves out worker fixtures such as the
// browser launch. Action totals add up steps that run in parallel, such as the
// region clips of `regions-prepare`, so they can exceed their phase time.
import { mkdirSync, writeFileSync } from "node:fs";
import { loadavg } from "node:os";
import path from "node:path";
import type {
  Reporter,
  TestCase,
  TestResult,
  TestStep,
} from "@playwright/test/reporter";

interface Bucket {
  count: number;
  ms: number;
}

interface TestRow {
  file: string;
  title: string;
  retry: number;
  status: string;
  ms: number;
  phases: Record<string, number>;
  screenshots: Bucket;
  navigations: Bucket;
}

function add(map: Map<string, Bucket>, key: string, ms: number) {
  const bucket = map.get(key) ?? { count: 0, ms: 0 };
  bucket.count += 1;
  bucket.ms += ms;
  map.set(key, bucket);
}

interface MoveTimeParams {
  map: Map<string, Bucket>;
  from: string;
  to: string;
  ms: number;
}

function moveTime({ map, from, to, ms }: MoveTimeParams) {
  add(map, to, ms);
  const parent = map.get(from);
  if (parent) {
    parent.ms -= ms;
  }
}

function actionName(title: string) {
  if (title.startsWith("Expect")) {
    return title.replace(/^(Expect "[^"]*").*$/, "$1");
  }
  return title.replace(/\s*".*$/, "").trim();
}

function phaseOf(step: TestStep, current: string) {
  if (step.category === "test.step" && step.title.startsWith("phase:")) {
    return step.title.slice("phase:".length);
  }
  if (step.category === "hook") return `hook:${step.title}`;
  if (step.category === "fixture") return "fixture";
  return current;
}

export default class VisualTimingReporter implements Reporter {
  private actions = new Map<string, Bucket>();
  private phases = new Map<string, Bucket>();
  private tests: TestRow[] = [];
  private loads: number[] = [];
  private timer: ReturnType<typeof setInterval> | undefined;
  private started = Date.now();

  onBegin() {
    this.started = Date.now();
    this.timer = setInterval(() => {
      const [load] = loadavg();
      if (load != null) {
        this.loads.push(load);
      }
    }, 5000);
  }

  onTestEnd(test: TestCase, result: TestResult) {
    const stepsMs = result.steps.reduce((sum, step) => sum + step.duration, 0);
    const row: TestRow = {
      file: path.relative(process.cwd(), test.location.file),
      title: test.title,
      retry: result.retry,
      status: result.status,
      ms: result.duration,
      phases: { body: stepsMs },
      screenshots: { count: 0, ms: 0 },
      navigations: { count: 0, ms: 0 },
    };
    const walk = (steps: TestStep[], phase: string) => {
      for (const step of steps) {
        const next = phaseOf(step, phase);
        if (next !== phase) {
          moveTime({
            map: this.phases,
            from: phase,
            to: next,
            ms: step.duration,
          });
          row.phases[next] = (row.phases[next] ?? 0) + step.duration;
          row.phases[phase] = (row.phases[phase] ?? 0) - step.duration;
        }
        if (
          step.category === "pw:api" ||
          step.category === "expect" ||
          step.category === "test.attach"
        ) {
          const name = actionName(step.title);
          add(this.actions, `${next} | ${name}`, step.duration);
          if (name === "Screenshot") {
            row.screenshots.count += 1;
            row.screenshots.ms += step.duration;
          }
          if (name === "Navigate") {
            row.navigations.count += 1;
            row.navigations.ms += step.duration;
          }
          continue;
        }
        walk(step.steps, next);
      }
    };
    add(this.phases, "body", stepsMs);
    walk(result.steps, "body");
    this.tests.push(row);
  }

  onEnd() {
    clearInterval(this.timer);
    const sortedLoads = [...this.loads].sort((a, b) => a - b);
    const median = sortedLoads[Math.floor(sortedLoads.length / 2)] ?? 0;
    const summary = {
      arm: process.env.VISUAL_EXPERIMENT_ARM ?? "",
      wallMs: Date.now() - this.started,
      testMs: this.tests.reduce((sum, row) => sum + row.ms, 0),
      // Retried attempts are in the totals too, so a flakier arm reads slower.
      retriedAttempts: this.tests.filter((row) => row.retry > 0).length,
      loadavg: { median, samples: this.loads.length },
      phases: Object.fromEntries(this.phases),
      actions: Object.fromEntries(this.actions),
      tests: this.tests,
    };
    const file = path.join(process.cwd(), "test-results", "visual-timing.json");
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, JSON.stringify(summary, null, 2));
    const lines = [
      `visual-timing arm=${summary.arm} wall=${(summary.wallMs / 1000).toFixed(0)}s tests=${(summary.testMs / 1000).toFixed(0)}s retried=${summary.retriedAttempts} load-median=${median.toFixed(1)}`,
    ];
    const byMs = (entries: [string, Bucket][]) =>
      entries.sort((a, b) => b[1].ms - a[1].ms);
    for (const [key, bucket] of byMs([...this.phases])) {
      lines.push(
        `phase ${key}: ${(bucket.ms / 1000).toFixed(1)}s in ${bucket.count}`,
      );
    }
    for (const [key, bucket] of byMs([...this.actions]).slice(0, 60)) {
      lines.push(
        `action ${key}: ${(bucket.ms / 1000).toFixed(1)}s in ${bucket.count} (${(bucket.ms / bucket.count).toFixed(0)}ms)`,
      );
    }
    console.log(lines.join("\n"));
  }

  printsToStdio() {
    return false;
  }
}
