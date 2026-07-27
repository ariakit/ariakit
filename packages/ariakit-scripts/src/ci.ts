import { execFileSync } from "node:child_process";
import { appendFileSync } from "node:fs";
import { isDeepStrictEqual } from "node:util";

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
  workflows: Record<CIWorkflowName, boolean>;
  reasons: Record<CIWorkflowName, string[]>;
}

export interface CreateCIPlanOptions {
  baseRef?: string;
  changedLockfileImporters?: string[];
  packageJSONChanges?: PackageJSONChange[];
}

export interface PackageJSONChange {
  file: string;
  base: Record<string, unknown>;
  head: Record<string, unknown>;
}

export interface RunCIPlanOptions {
  base: string;
  head: string;
  baseRef: string;
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

const dependencyFields = [
  "dependencies",
  "devDependencies",
  "optionalDependencies",
  "peerDependencies",
] as const;

const dependencyFieldSet = new Set<string>(dependencyFields);
const runtimeDependencyFieldSet = new Set([
  "dependencies",
  "optionalDependencies",
  "peerDependencies",
]);
const publicPackageFields = new Set([...dependencyFieldSet, "version"]);
const publicPackageWorkflows = [
  "app",
  "perf",
  "plus",
  "release_preview",
  "docs",
  "og_images",
] as const satisfies readonly CIWorkflowName[];

// Root tools outside this reviewed set can affect any workspace, so they
// continue to fail closed to full CI.
const rootMainDependencies = new Set([
  "@testing-library/jest-dom",
  "@testing-library/react",
  "@types/cross-spawn",
  "@types/fs-extra",
  "@types/node",
  "@types/react",
  "@types/react-dom",
  "@vitest/coverage-v8",
  "happy-dom",
  "husky",
  "lint-staged",
  "oxfmt",
  "oxlint",
  "oxlint-tsgolint",
  "prettier",
  "prettier-plugin-tailwindcss",
  "stylelint",
  "stylelint-config-standard",
  "vitest",
  "vitest-fail-on-console",
]);

const workspaceDependencyWorkflows = new Map<string, readonly CIWorkflowName[]>(
  [
    ["app/package.json", ["app", "perf", "og_images"]],
    ["examples/package.json", []],
    ["guide/package.json", ["plus"]],
    ["nextjs/package.json", ["app", "perf"]],
    ["templates/react/package.json", ["release_preview"]],
    ["website/package.json", ["plus"]],
  ],
);

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

function getChangedFields(
  base: Record<string, unknown>,
  head: Record<string, unknown>,
) {
  const fields = new Set([...Object.keys(base), ...Object.keys(head)]);
  return [...fields].filter((field) => {
    return !isDeepStrictEqual(base[field], head[field]);
  });
}

function getStringRecord(value: unknown) {
  if (value === undefined) return {};
  if (!isRecord(value)) return;
  const record: Record<string, string> = {};
  for (const [key, item] of Object.entries(value)) {
    if (typeof item !== "string") return;
    record[key] = item;
  }
  return record;
}

function getChangedDependencyNames(
  base: Record<string, unknown>,
  head: Record<string, unknown>,
) {
  const names = new Set<string>();
  for (const field of dependencyFields) {
    if (isDeepStrictEqual(base[field], head[field])) continue;
    const baseDependencies = getStringRecord(base[field]);
    const headDependencies = getStringRecord(head[field]);
    if (!baseDependencies || !headDependencies) return;
    for (const name of new Set([
      ...Object.keys(baseDependencies),
      ...Object.keys(headDependencies),
    ])) {
      if (baseDependencies[name] !== headDependencies[name]) {
        names.add(name);
      }
    }
  }
  return [...names].sort();
}

function explainsLockfileChange(change: PackageJSONChange) {
  const dependencyNames = getChangedDependencyNames(change.base, change.head);
  return Boolean(dependencyNames?.length);
}

function hasOnlyFields(fields: string[], allowedFields: Set<string>) {
  return fields.every((field) => allowedFields.has(field));
}

function addDependencyReason(
  plan: CIPlan,
  workflow: CIWorkflowName,
  file: string,
) {
  addReason(plan, workflow, `Dependency metadata: ${file}`);
}

function addPackageJSONReasons(plan: CIPlan, change: PackageJSONChange) {
  const file = normalizeCIPath(change.file);
  const fields = getChangedFields(change.base, change.head);
  const dependencyNames = getChangedDependencyNames(change.base, change.head);
  if (!dependencyNames) return false;
  const hasTypeDependencyChange = dependencyNames.some((name) => {
    return name.startsWith("@types/");
  });

  if (file === "package.json") {
    if (!hasOnlyFields(fields, dependencyFieldSet)) return false;
    if (dependencyNames.some((name) => !rootMainDependencies.has(name))) {
      return false;
    }
    addDependencyReason(plan, "main", file);
    if (dependencyNames.includes("vitest")) {
      addDependencyReason(plan, "perf", file);
    }
    if (dependencyNames.includes("oxfmt") || hasTypeDependencyChange) {
      addDependencyReason(plan, "docs", file);
    }
    return true;
  }

  const workspaceWorkflows = workspaceDependencyWorkflows.get(file);
  if (workspaceWorkflows) {
    if (!hasOnlyFields(fields, dependencyFieldSet)) return false;
    addDependencyReason(plan, "main", file);
    for (const workflow of workspaceWorkflows) {
      addDependencyReason(plan, workflow, file);
    }
    return true;
  }

  if (!/^packages\/[^/]+\/package\.json$/.test(file)) return false;
  if (change.base.private === true) return false;
  if (change.head.private === true) return false;
  if (!hasOnlyFields(fields, publicPackageFields)) return false;
  if (
    fields.includes("version") &&
    (typeof change.base.version !== "string" ||
      typeof change.head.version !== "string")
  ) {
    return false;
  }
  addDependencyReason(plan, "main", file);
  if (hasTypeDependencyChange) {
    addDependencyReason(plan, "docs", file);
  }
  if (fields.some((field) => runtimeDependencyFieldSet.has(field))) {
    for (const workflow of publicPackageWorkflows) {
      addDependencyReason(plan, workflow, file);
    }
  }
  return true;
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
  const packageJSONChanges = new Map(
    (options.packageJSONChanges ?? []).map((change) => {
      return [normalizeCIPath(change.file), change] as const;
    }),
  );
  const changedPackageJSONFiles = files.filter((file) => {
    return /(?:^|\/)package\.json$/.test(file);
  });
  const changedPackageJSONFileSet = new Set(changedPackageJSONFiles);
  const hasScopedPackageJSONChanges =
    changedPackageJSONFiles.length > 0 &&
    changedPackageJSONFiles.every((file) => {
      const change = packageJSONChanges.get(file);
      return change ? explainsLockfileChange(change) : false;
    });
  const changedLockfileImporters = options.changedLockfileImporters ?? [];
  const hasScopedLockfileChanges =
    changedLockfileImporters.length > 0 &&
    changedLockfileImporters.every((importer) => {
      const file =
        importer === "." ? "package.json" : `${importer}/package.json`;
      return changedPackageJSONFileSet.has(normalizeCIPath(file));
    });
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
    workflows,
    reasons,
  };

  addReason(plan, "main", "Core and legacy browser tests run on every PR");
  for (const file of files) {
    // Manifest and importer diffs together establish whether the generated
    // lockfile is fully attributable to the changed manifests.
    if (
      file === "pnpm-lock.yaml" &&
      hasScopedPackageJSONChanges &&
      hasScopedLockfileChanges
    ) {
      continue;
    }
    const packageJSONChange = packageJSONChanges.get(file);
    if (packageJSONChange && addPackageJSONReasons(plan, packageJSONChange)) {
      continue;
    }
    addFileReasons(plan, file);
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

function readPackageJSON(revision: string, file: string) {
  try {
    const value = readRevisionFile(revision, file);
    if (value === undefined) return;
    const packageJSON: unknown = JSON.parse(value);
    if (!isRecord(packageJSON)) return;
    return packageJSON;
  } catch {
    return;
  }
}

function readRevisionFile(revision: string, file: string) {
  try {
    return execFileSync("git", ["show", `${revision}:${file}`], {
      encoding: "utf-8",
      maxBuffer: 10 * 1024 * 1024,
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    return;
  }
}

function parseLockfileImporters(value: string) {
  const lines = value.replaceAll("\r\n", "\n").split("\n");
  const importersIndex = lines.indexOf("importers:");
  if (importersIndex < 0) return;

  const importers = new Map<string, string>();
  let currentImporter: string | undefined;
  let currentBlock: string[] = [];
  const saveCurrentImporter = () => {
    if (!currentImporter) return true;
    if (importers.has(currentImporter)) return false;
    importers.set(currentImporter, currentBlock.join("\n").trimEnd());
    return true;
  };

  for (let index = importersIndex + 1; index < lines.length; index++) {
    const line = lines[index];
    if (line === undefined) return;
    if (line && !line.startsWith(" ")) {
      if (!/^[^:\s][^:]*:/.test(line)) return;
      break;
    }
    const match = /^  ([a-zA-Z0-9._@/-]+):(?: \{\})?$/.exec(line);
    if (match) {
      if (!saveCurrentImporter()) return;
      currentImporter = match[1];
      currentBlock = [line];
      continue;
    }
    if (!line) {
      if (currentImporter) currentBlock.push(line);
      continue;
    }
    if (!currentImporter) return;
    if (!/^ {4}(?: {2})*[^#\s][^:]*:/.test(line)) return;
    currentBlock.push(line);
  }
  if (!saveCurrentImporter()) return;
  if (importers.size === 0) return;
  return importers;
}

export function parseLockfileImporterChanges(base: string, head: string) {
  const baseImporters = parseLockfileImporters(base);
  const headImporters = parseLockfileImporters(head);
  if (!baseImporters || !headImporters) return;
  if (baseImporters.size !== headImporters.size) return;
  for (const importer of baseImporters.keys()) {
    if (!headImporters.has(importer)) return;
  }
  return [...baseImporters.keys()]
    .filter((importer) => {
      return baseImporters.get(importer) !== headImporters.get(importer);
    })
    .sort();
}

export function getPackageJSONChanges(
  base: string,
  head: string,
  files: string[],
) {
  const mergeBase = execFileSync("git", ["merge-base", base, head], {
    encoding: "utf-8",
  }).trim();
  const changes: PackageJSONChange[] = [];
  for (const changedFile of files) {
    const file = normalizeCIPath(changedFile);
    if (!/(?:^|\/)package\.json$/.test(file)) continue;
    const basePackageJSON = readPackageJSON(mergeBase, file);
    const headPackageJSON = readPackageJSON(head, file);
    if (!basePackageJSON || !headPackageJSON) continue;
    changes.push({
      file,
      base: basePackageJSON,
      head: headPackageJSON,
    });
  }
  return changes;
}

export function getLockfileImporterChanges(
  base: string,
  head: string,
  files: string[],
) {
  if (!files.map(normalizeCIPath).includes("pnpm-lock.yaml")) return;
  const mergeBase = execFileSync("git", ["merge-base", base, head], {
    encoding: "utf-8",
  }).trim();
  const baseLockfile = readRevisionFile(mergeBase, "pnpm-lock.yaml");
  const headLockfile = readRevisionFile(head, "pnpm-lock.yaml");
  if (baseLockfile === undefined || headLockfile === undefined) return;
  return parseLockfileImporterChanges(baseLockfile, headLockfile);
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
  const plan = createCIPlan(files, {
    baseRef: options.baseRef,
    changedLockfileImporters: getLockfileImporterChanges(
      options.base,
      options.head,
      files,
    ),
    packageJSONChanges: getPackageJSONChanges(
      options.base,
      options.head,
      files,
    ),
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
