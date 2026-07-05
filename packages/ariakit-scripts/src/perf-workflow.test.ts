import { execFileSync } from "node:child_process";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, expect, test } from "vitest";

const workflowPath = path.join(
  import.meta.dirname,
  "../../../.github/workflows/perf.yml",
);
const chromePerfFile = "src/sandbox/example/perf-chrome.ts";
const nodeBenchFile = "packages/example/benchmark/example.bench.ts";
const tempDirs: string[] = [];

function createTempDir() {
  const dir = realpathSync(
    mkdtempSync(path.join(tmpdir(), "ariakit-perf-workflow-")),
  );
  tempDirs.push(dir);
  return dir;
}

// Collect every value a workflow env key is set to, across all jobs.
function readWorkflowEnvValues(key: string): string[] {
  const content = readFileSync(workflowPath, "utf-8");
  const pattern = new RegExp(`^\\s+${key}: (.+)$`, "gm");
  return [...content.matchAll(pattern)].map((match) => match[1] ?? "");
}

// Extract the shell script of a named workflow step so the tests exercise the
// exact code CI runs instead of a copy that could drift.
function extractStepScript(stepName: string): string {
  const lines = readFileSync(workflowPath, "utf-8").split("\n");
  const nameIndex = lines.findIndex(
    (line) => line.trim() === `- name: ${stepName}`,
  );
  if (nameIndex < 0) {
    throw new Error(`Missing workflow step: ${stepName}`);
  }
  const runIndex = lines.findIndex(
    (line, index) => index > nameIndex && line.trim() === "run: |",
  );
  const runLine = lines[runIndex];
  if (runIndex < 0 || runLine == null) {
    throw new Error(`Missing run block for workflow step: ${stepName}`);
  }
  const indent = runLine.search(/\S/) + 2;
  const body: string[] = [];
  for (let index = runIndex + 1; index < lines.length; index++) {
    const line = lines[index];
    if (line == null) break;
    if (!line.trim()) {
      body.push("");
      continue;
    }
    if (line.search(/\S/) < indent) break;
    body.push(line.slice(indent));
  }
  return body.join("\n");
}

// The stubs replace the perf/bench invocations with cheap file writes and
// serve one line of the comparison plan (a confirmationFiles JSON array per
// perf-compare call) so the tests can steer the confirmation loop.
function writeStubBinaries(binDir: string) {
  mkdirSync(binDir, { recursive: true });
  const pnpmStub = `#!/usr/bin/env bash
set -e
args="$*"
case "$args" in
  *test-perf*)
    echo "test-perf" >> "$PERF_STUB_DIR/log"
    mkdir -p app/.perf-results
    printf '[]\\n' > "app/.perf-results/\${PERF_RESULTS_FILE%.json}-worker0.json"
    ;;
  *"vitest bench"*)
    output=""
    previous=""
    for argument in "$@"; do
      if [ "$previous" = "--outputJson" ]; then output="$argument"; fi
      previous="$argument"
    done
    echo "bench" >> "$PERF_STUB_DIR/log"
    mkdir -p "$(dirname "$output")"
    printf '{"files":[]}\\n' > "$output"
    ;;
  *perf-compare*)
    count=$(cat "$PERF_STUB_DIR/count" 2>/dev/null || echo 0)
    count=$((count + 1))
    echo "$count" > "$PERF_STUB_DIR/count"
    plan_line="$(sed -n "\${count}p" "$PERF_STUB_DIR/plan")"
    if [ -z "$plan_line" ]; then plan_line='[]'; fi
    echo "compare" >> "$PERF_STUB_DIR/log"
    case "$args" in
      *--node*) results_dir=".perf-results" ;;
      *) results_dir="app/.perf-results" ;;
    esac
    mkdir -p "$results_dir"
    printf '{"confirmationFiles": %s}\\n' "$plan_line" > "$results_dir/comparison.json"
    ;;
  *)
    echo "Unexpected pnpm invocation: $args" >&2
    exit 1
    ;;
esac
`;
  const xvfbRunStub = `#!/usr/bin/env bash
if [ "$1" = "-a" ]; then shift; fi
exec "$@"
`;
  writeFileSync(path.join(binDir, "pnpm"), pnpmStub);
  writeFileSync(path.join(binDir, "xvfb-run"), xvfbRunStub);
  chmodSync(path.join(binDir, "pnpm"), 0o755);
  chmodSync(path.join(binDir, "xvfb-run"), 0o755);
}

// CI runners have bash >= 4, but macOS ships bash 3.2 without mapfile. Shim
// the one usage shape (`mapfile -t NAME <<< input`) so local runs work too.
function writeBashEnv(tempDir: string) {
  const bashEnvFile = path.join(tempDir, "bash-env.sh");
  const shim = `if ! type mapfile >/dev/null 2>&1; then
  mapfile() {
    local _flag="$1" _name="$2"
    local _line _index=0
    eval "$_name=()"
    while IFS= read -r _line; do
      eval "$_name[\\$_index]=\\$_line"
      _index=$((_index + 1))
    done
  }
fi
`;
  writeFileSync(bashEnvFile, shim);
  return bashEnvFile;
}

interface StepRunResult {
  stdout: string;
  workspaceDir: string;
  stubDir: string;
}

function runStepScript(
  stepName: string,
  confirmationPlans: string[][],
  env: NodeJS.ProcessEnv,
): StepRunResult {
  const tempDir = createTempDir();
  const binDir = path.join(tempDir, "bin");
  const stubDir = path.join(tempDir, "stub");
  const workspaceDir = path.join(tempDir, "workspace");
  const baselineDir = path.join(tempDir, "baseline");
  mkdirSync(stubDir, { recursive: true });
  mkdirSync(path.join(workspaceDir, "app"), { recursive: true });
  mkdirSync(path.join(baselineDir, "app"), { recursive: true });
  writeStubBinaries(binDir);
  const planLines = confirmationPlans.map((plan) => JSON.stringify(plan));
  writeFileSync(path.join(stubDir, "plan"), `${planLines.join("\n")}\n`);
  const scriptFile = path.join(tempDir, "step.sh");
  writeFileSync(scriptFile, extractStepScript(stepName));
  const stdout = execFileSync("bash", ["-e", scriptFile], {
    cwd: workspaceDir,
    encoding: "utf-8",
    env: {
      ...process.env,
      PATH: `${binDir}${path.delimiter}${process.env.PATH}`,
      BASH_ENV: writeBashEnv(tempDir),
      PERF_STUB_DIR: stubDir,
      BASELINE_DIR: baselineDir,
      // The Node step writes baseline results through $GITHUB_WORKSPACE,
      // which only exists on CI runners.
      GITHUB_WORKSPACE: workspaceDir,
      // The workflow provides the round counts through job env blocks; the
      // "pins the round counts" test asserts they match these values.
      PERF_INITIAL_ROUNDS: "2",
      PERF_CONFIRMATION_ROUNDS: "2",
      ...env,
    },
  });
  return { stdout, workspaceDir, stubDir };
}

function runChromeStep(confirmationPlans: string[][]) {
  return runStepScript("Run interleaved perf tests", confirmationPlans, {
    PERF_ITERATIONS: "5",
    PERF_WARMUP: "1",
    PERF_FILE: chromePerfFile,
    PERF_JOB_INDEX: "1",
    PERF_JOB_TITLE: "example",
  });
}

function runNodeStep(...confirmationPlans: string[][]) {
  return runStepScript("Run interleaved benchmarks", confirmationPlans, {});
}

function countStubCalls(stubDir: string, marker: string) {
  const logFile = path.join(stubDir, "log");
  if (!existsSync(logFile)) return 0;
  const lines = readFileSync(logFile, "utf-8").split("\n");
  return lines.filter((line) => line === marker).length;
}

function listRoundFiles(resultsDir: string, round: number) {
  if (!existsSync(resultsDir)) return [];
  const roundPattern = new RegExp(`^(?:baseline|current)-${round}[.-]`);
  return readdirSync(resultsDir).filter((file) => roundPattern.test(file));
}

function readManifest(workspaceDir: string) {
  const manifestFile = path.join(
    workspaceDir,
    "app/.perf-results/job-1-manifest.json",
  );
  return JSON.parse(readFileSync(manifestFile, "utf-8"));
}

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("pins the round counts both perf jobs configure", () => {
  // The step scenarios below inject these values themselves, so this is the
  // assertion that keeps the workflow env in sync with what they exercise.
  // Confirmation is capped at 2 extra rounds (4 paired rounds total) on
  // purpose: with a 3rd round the comparator would relax its requirement to
  // n-1 rounds, reopening the noise-prone candidate promotion path.
  expect(readWorkflowEnvValues("PERF_INITIAL_ROUNDS")).toEqual(["2", "2"]);
  expect(readWorkflowEnvValues("PERF_CONFIRMATION_ROUNDS")).toEqual(["2", "2"]);
});

test("chrome skips confirmation rounds on a clean preliminary comparison", () => {
  const { stdout, workspaceDir, stubDir } = runChromeStep([[]]);
  expect(countStubCalls(stubDir, "test-perf")).toBe(4);
  expect(countStubCalls(stubDir, "compare")).toBe(1);
  expect(stdout).not.toContain("retrying once");
  const resultsDir = path.join(workspaceDir, "app/.perf-results");
  expect(listRoundFiles(resultsDir, 3)).toHaveLength(0);
  const manifest = readManifest(workspaceDir);
  expect(manifest.status).toBe("success");
  expect(manifest.roundFiles).toHaveLength(4);
  expect(stdout).toContain("skipping confirmation rounds");
});

test("chrome stops confirmation rounds early once a re-comparison is clean", () => {
  const { stdout, workspaceDir, stubDir } = runChromeStep([
    [chromePerfFile],
    [],
  ]);
  expect(countStubCalls(stubDir, "test-perf")).toBe(6);
  expect(countStubCalls(stubDir, "compare")).toBe(2);
  const resultsDir = path.join(workspaceDir, "app/.perf-results");
  expect(listRoundFiles(resultsDir, 3)).toHaveLength(2);
  expect(listRoundFiles(resultsDir, 4)).toHaveLength(0);
  const manifest = readManifest(workspaceDir);
  expect(manifest.status).toBe("success");
  expect(manifest.roundFiles).toHaveLength(6);
  expect(stdout).toContain("stopping confirmation rounds early");
});

test("chrome runs every confirmation round while changes persist", () => {
  const { workspaceDir, stubDir } = runChromeStep([
    [chromePerfFile],
    [chromePerfFile],
  ]);
  expect(countStubCalls(stubDir, "test-perf")).toBe(8);
  // The post job compares every job's rounds, so the last confirmation round
  // needs no in-job re-comparison.
  expect(countStubCalls(stubDir, "compare")).toBe(2);
  const resultsDir = path.join(workspaceDir, "app/.perf-results");
  expect(listRoundFiles(resultsDir, 4)).toHaveLength(2);
  const manifest = readManifest(workspaceDir);
  expect(manifest.status).toBe("success");
  expect(manifest.roundFiles).toHaveLength(8);
});

test("node skips confirmation rounds on a clean preliminary comparison", () => {
  const { stdout, stubDir } = runNodeStep([]);
  expect(countStubCalls(stubDir, "bench")).toBe(4);
  expect(countStubCalls(stubDir, "compare")).toBe(1);
  expect(stdout).not.toContain("Baseline benchmark run failed");
  expect(stdout).toContain("skipping confirmation rounds");
});

test("node stops confirmation rounds early once a re-comparison is clean", () => {
  const { stdout, workspaceDir, stubDir } = runNodeStep([nodeBenchFile], []);
  expect(countStubCalls(stubDir, "bench")).toBe(6);
  expect(countStubCalls(stubDir, "compare")).toBe(2);
  const resultsDir = path.join(workspaceDir, ".perf-results");
  expect(listRoundFiles(resultsDir, 3)).toHaveLength(2);
  expect(listRoundFiles(resultsDir, 4)).toHaveLength(0);
  expect(stdout).toContain("No significant changes remain after round 3");
});

test("node re-compares after the final confirmation round", () => {
  const { workspaceDir, stubDir } = runNodeStep(
    [nodeBenchFile],
    [nodeBenchFile],
    [nodeBenchFile],
  );
  expect(countStubCalls(stubDir, "bench")).toBe(8);
  // Unlike Chrome, the Node job publishes its own comparison, so the last
  // confirmation round is followed by the comparison that gets uploaded.
  expect(countStubCalls(stubDir, "compare")).toBe(3);
  const resultsDir = path.join(workspaceDir, ".perf-results");
  expect(listRoundFiles(resultsDir, 4)).toHaveLength(2);
});
