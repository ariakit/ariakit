import { execFileSync } from "node:child_process";
import { appendFileSync } from "node:fs";

export const ciWorkflowNames = [
  "main",
  "app",
  "perf",
  "plus",
  "release_preview",
  "docs",
  "build_styles",
  "og_images",
] as const;

export type CIWorkflowName = (typeof ciWorkflowNames)[number];

export interface CIPlan {
  version: 1;
  baseRef: string;
  files: string[];
  labels: string[];
  workflows: Record<CIWorkflowName, boolean>;
  reasons: Record<CIWorkflowName, string[]>;
}

export interface CreateCIPlanOptions {
  baseRef?: string;
  labels?: string[];
}

export interface RunCIPlanOptions {
  base: string;
  head: string;
  baseRef: string;
  labels: string;
  output: string;
}

export interface CIGateResult {
  result?: string;
}

export interface RunCIGateOptions {
  plan: string;
  results: string;
}

type CIResults = Record<string, CIGateResult | undefined>;

interface CIGatePlan {
  version: 1;
  workflows: Record<CIWorkflowName, boolean>;
}

const workflowLabels: Record<string, CIWorkflowName> = {
  "ci:app": "app",
  "ci:build-styles": "build_styles",
  "ci:docs": "docs",
  "ci:main": "main",
  "ci:og-images": "og_images",
  "ci:perf": "perf",
  "ci:plus": "plus",
  "ci:release-preview": "release_preview",
};

const dependencyAndConfigNames = new Set([
  ".npmrc",
  "bun.lock",
  "bun.lockb",
  "package-lock.json",
  "package.json",
  "pnpm-lock.yaml",
  "pnpm-workspace.yaml",
  "wrangler.json",
  "wrangler.jsonc",
  "wrangler.toml",
  "yarn.lock",
]);

const labeledDependencyManifests = new Set([
  "app/package.json",
  "examples/package.json",
  "guide/package.json",
  "nextjs/package.json",
  "package.json",
  "packages/ariakit-components/package.json",
  "packages/ariakit-react-components/package.json",
  "packages/ariakit-react-store/package.json",
  "packages/ariakit-react-utils/package.json",
  "packages/ariakit-react/package.json",
  "packages/ariakit-solid-components/package.json",
  "packages/ariakit-solid-store/package.json",
  "packages/ariakit-solid-utils/package.json",
  "packages/ariakit-solid/package.json",
  "packages/ariakit-store/package.json",
  "packages/ariakit-tailwind/package.json",
  "packages/ariakit-test/package.json",
  "packages/ariakit-utils/package.json",
  "templates/react/package.json",
  "website/package.json",
]);

const publishPackageNames = new Set([
  "ariakit-components",
  "ariakit-react",
  "ariakit-react-components",
  "ariakit-react-store",
  "ariakit-react-utils",
  "ariakit-solid",
  "ariakit-solid-components",
  "ariakit-solid-store",
  "ariakit-solid-utils",
  "ariakit-store",
  "ariakit-tailwind",
  "ariakit-test",
  "ariakit-utils",
]);

function normalizeCIPath(file: string) {
  return file.replaceAll("\\", "/").replace(/^\.\/+/, "");
}

function isMarkdown(file: string) {
  return /\.(?:md|mdx)$/i.test(file);
}

function isTestFile(file: string) {
  return (
    /(?:^|\/)__tests__\//.test(file) ||
    /(?:^|\/)__screenshots__\//.test(file) ||
    /\.(?:test|spec)\.[cm]?[jt]sx?$/.test(file)
  );
}

function isFullCIPath(file: string) {
  if (
    file.startsWith(".github/") ||
    file.startsWith("packages/ariakit-scripts/") ||
    file.startsWith("patches/") ||
    file.startsWith("scripts/")
  ) {
    return true;
  }
  const name = file.slice(file.lastIndexOf("/") + 1);
  if (dependencyAndConfigNames.has(name)) return true;
  if (/(?:^|\.)config(?:\.|$)/.test(name)) return true;
  if (/^tsconfig(?:\.[^/]+)?\.json$/.test(name)) return true;
  if (!file.includes("/") && !isMarkdown(file)) return true;
  return false;
}

function isPackageRuntimePath(file: string) {
  if (!file.startsWith("packages/")) return false;
  if (isMarkdown(file) || isTestFile(file)) return false;
  return true;
}

function isAppRuntimePath(file: string) {
  if (!/^(?:app|nextjs)\//.test(file)) return false;
  if (isTestFile(file)) return false;
  return true;
}

function isLabeledDependencyFile(file: string) {
  return file === "pnpm-lock.yaml" || labeledDependencyManifests.has(file);
}

function isPublishFile(file: string) {
  if (file === "pnpm-lock.yaml") return true;
  if (/^\.changeset\/[^/]+\.md$/i.test(file)) return true;
  const match = /^packages\/([^/]+)\/(?:CHANGELOG\.md|package\.json)$/.exec(
    file,
  );
  return !!match?.[1] && publishPackageNames.has(match[1]);
}

function addReason(plan: CIPlan, workflow: CIWorkflowName, reason: string) {
  plan.workflows[workflow] = true;
  const reasons = plan.reasons[workflow];
  if (!reasons.includes(reason)) {
    reasons.push(reason);
  }
}

function addFullCIReason(plan: CIPlan, file: string) {
  for (const workflow of ciWorkflowNames) {
    addReason(plan, workflow, `Repository-wide CI input: ${file}`);
  }
}

function addFileReasons(plan: CIPlan, file: string) {
  if (isFullCIPath(file)) {
    addFullCIReason(plan, file);
    return;
  }

  let matched = false;
  if (/^(?:app|nextjs)\//.test(file) || isPackageRuntimePath(file)) {
    addReason(plan, "app", `App input: ${file}`);
    matched = true;
  }

  if (isAppRuntimePath(file) || isPackageRuntimePath(file)) {
    addReason(plan, "perf", `Performance-sensitive runtime: ${file}`);
    matched = true;
  }

  if (isPackageRuntimePath(file)) {
    addReason(plan, "release_preview", `Publishable package input: ${file}`);
    matched = true;
  }

  if (
    isPackageRuntimePath(file) ||
    /^packages\/[^/]+\/readme\.md$/i.test(file)
  ) {
    addReason(plan, "docs", `API documentation input: ${file}`);
    matched = true;
  }

  if (/^(?:website|guide)\//.test(file) || isPackageRuntimePath(file)) {
    addReason(plan, "plus", `Plus website input: ${file}`);
    matched = true;
  }

  if (
    file.startsWith("app/src/styles/") ||
    /^app\/src\/lib\/(?:build-styles|styles(?:-json-types|-shared)?)\.ts$/.test(
      file,
    )
  ) {
    addReason(plan, "build_styles", `Generated styles input: ${file}`);
    matched = true;
  }

  if (
    file.startsWith("app/public/og-image/") ||
    (file.startsWith("app/src/") && !isTestFile(file)) ||
    isPackageRuntimePath(file)
  ) {
    addReason(plan, "og_images", `OG image input: ${file}`);
    matched = true;
  }

  if (file.startsWith(".changeset/") || file.startsWith("templates/")) {
    addReason(plan, "release_preview", `Release preview input: ${file}`);
    matched = true;
  }

  const safelyCoveredByMain =
    isMarkdown(file) ||
    file.startsWith("examples/") ||
    (file.startsWith("packages/") && isTestFile(file));
  if (!matched && !safelyCoveredByMain) {
    addFullCIReason(plan, file);
  }
}

export function createCIPlan(
  changedFiles: string[],
  options: CreateCIPlanOptions = {},
) {
  const files = [
    ...new Set(changedFiles.map(normalizeCIPath).filter(Boolean)),
  ].sort();
  const labels = [...new Set(options.labels ?? [])].sort();
  const workflows: Record<CIWorkflowName, boolean> = {
    main: false,
    app: false,
    perf: false,
    plus: false,
    release_preview: false,
    docs: false,
    build_styles: false,
    og_images: false,
  };
  const reasons: Record<CIWorkflowName, string[]> = {
    main: [],
    app: [],
    perf: [],
    plus: [],
    release_preview: [],
    docs: [],
    build_styles: [],
    og_images: [],
  };
  const plan: CIPlan = {
    version: 1,
    baseRef: options.baseRef ?? "",
    files,
    labels,
    workflows,
    reasons,
  };

  addReason(plan, "main", "Core and legacy browser tests run on every PR");
  const labeledDependencyUpdate = labels.includes("ci:deps");
  const publishUpdate = labels.includes("ci:publish");
  for (const file of files) {
    if (publishUpdate && isPublishFile(file)) continue;
    if (labeledDependencyUpdate && isLabeledDependencyFile(file)) continue;
    addFileReasons(plan, file);
  }
  if (labeledDependencyUpdate) {
    addReason(plan, "main", "Dependency CI selected by labels");
  }
  if (publishUpdate) {
    addReason(plan, "main", "Changesets publish metadata");
  }

  if (labels.includes("ci:full")) {
    for (const workflow of ciWorkflowNames) {
      addReason(plan, workflow, "Forced by ci:full label");
    }
  } else {
    for (const label of labels) {
      if (!Object.hasOwn(workflowLabels, label)) continue;
      const workflow = workflowLabels[label];
      if (workflow) {
        addReason(plan, workflow, `Forced by ${label} label`);
      }
    }
  }

  if (plan.baseRef && plan.baseRef !== "main") {
    plan.workflows.release_preview = false;
    plan.reasons.release_preview = [];
  }

  return plan;
}

export function getChangedFiles(base: string, head: string) {
  const output = execFileSync(
    "git",
    [
      "diff",
      "--find-renames",
      "--name-status",
      "--diff-filter=ACDMRTUXB",
      "-z",
      `${base}...${head}`,
    ],
    { encoding: "utf-8", maxBuffer: 10 * 1024 * 1024 },
  );
  return parseChangedFiles(output);
}

export function parseChangedFiles(output: string) {
  const fields = output.split("\0");
  const files: string[] = [];
  let index = 0;
  while (index < fields.length) {
    const status = fields[index++];
    if (!status) break;
    const file = fields[index++];
    if (!file) {
      throw new Error(`Missing path for git diff status: ${status}`);
    }
    files.push(file);
    if (status.startsWith("R") || status.startsWith("C")) {
      const destination = fields[index++];
      if (!destination) {
        throw new Error(`Missing destination for git diff status: ${status}`);
      }
      files.push(destination);
    }
  }
  return files;
}

function parseJSON(value: string, label: string) {
  try {
    const parsed: unknown = JSON.parse(value);
    return parsed;
  } catch (error) {
    throw new Error(`Invalid ${label} JSON`, { cause: error });
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function parseCIPlan(value: string) {
  const plan = parseJSON(value, "CI plan");
  if (!isRecord(plan)) {
    throw new Error("CI plan must be an object");
  }
  if (plan.version !== 1) {
    throw new Error(`Unsupported CI plan version: ${String(plan.version)}`);
  }
  if (!isRecord(plan.workflows)) {
    throw new Error("CI plan is missing workflows");
  }
  for (const workflow of ciWorkflowNames) {
    if (typeof plan.workflows[workflow] !== "boolean") {
      throw new Error(`CI plan is missing workflow: ${workflow}`);
    }
  }
  return {
    version: 1,
    workflows: {
      main: plan.workflows.main === true,
      app: plan.workflows.app === true,
      perf: plan.workflows.perf === true,
      plus: plan.workflows.plus === true,
      release_preview: plan.workflows.release_preview === true,
      docs: plan.workflows.docs === true,
      build_styles: plan.workflows.build_styles === true,
      og_images: plan.workflows.og_images === true,
    },
  } satisfies CIGatePlan;
}

function parseCIResults(value: string) {
  const results = parseJSON(value, "CI results");
  if (!isRecord(results)) {
    throw new Error("CI results must be an object");
  }
  const parsedResults: CIResults = {};
  for (const [name, result] of Object.entries(results)) {
    if (!isRecord(result)) continue;
    parsedResults[name] = {
      result: typeof result.result === "string" ? result.result : undefined,
    };
  }
  return parsedResults;
}

export function assertCIGate(plan: CIGatePlan, results: CIResults) {
  const failures: string[] = [];
  if (results.plan?.result !== "success") {
    failures.push(`plan: expected success, received ${results.plan?.result}`);
  }

  for (const workflow of ciWorkflowNames) {
    const expected = plan.workflows[workflow] ? "success" : "skipped";
    const actual = results[workflow]?.result;
    if (actual !== expected) {
      failures.push(`${workflow}: expected ${expected}, received ${actual}`);
    }
  }

  if (failures.length > 0) {
    throw new Error(`CI gate failed:\n- ${failures.join("\n- ")}`);
  }
}

export function serializeCIGatePlan(plan: CIPlan) {
  return JSON.stringify({
    version: plan.version,
    workflows: plan.workflows,
  } satisfies CIGatePlan);
}

export function runCIPlan(options: RunCIPlanOptions) {
  const files = getChangedFiles(options.base, options.head);
  const parsedLabels = parseJSON(options.labels, "CI labels");
  if (
    !Array.isArray(parsedLabels) ||
    !parsedLabels.every((label) => typeof label === "string")
  ) {
    throw new Error("CI labels must be an array of strings");
  }
  const plan = createCIPlan(files, {
    baseRef: options.baseRef,
    labels: parsedLabels,
  });
  for (const workflow of ciWorkflowNames) {
    appendFileSync(
      options.output,
      `${workflow}=${String(plan.workflows[workflow])}\n`,
    );
  }
  appendFileSync(options.output, `plan=${serializeCIGatePlan(plan)}\n`);

  console.log(`Changed files (${files.length}):`);
  for (const file of files) {
    console.log(`- ${file}`);
  }
  console.log("CI plan:");
  for (const workflow of ciWorkflowNames) {
    const state = plan.workflows[workflow] ? "run" : "skip";
    const reason = plan.reasons[workflow].join("; ");
    console.log(`- ${workflow}: ${state}${reason ? ` (${reason})` : ""}`);
  }
}

export function runCIGate(options: RunCIGateOptions) {
  const plan = parseCIPlan(options.plan);
  const results = parseCIResults(options.results);
  assertCIGate(plan, results);
  console.log("All planned CI workflows completed with the expected result.");
}
