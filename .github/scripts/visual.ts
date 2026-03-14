import path from "node:path";

import { githubRequest } from "./lib/github.ts";
import {
  findPaths,
  getRepositoryRoot,
  getRequiredEnv,
  removePaths,
  runCommand,
  setOutput,
} from "./lib/workflow.ts";

interface WorkflowRunJobStep {
  name?: string;
}

interface WorkflowRunJob {
  name: string;
  steps?: WorkflowRunJobStep[];
}

interface WorkflowJobsResponse {
  jobs: WorkflowRunJob[];
}

interface Artifact {
  name: string;
}

interface WorkflowRunArtifactsResponse {
  artifacts: Artifact[];
}

interface SnapshotJob {
  name: string;
  project?: string;
}

async function listJobsForWorkflowRun(
  runId: string,
): Promise<WorkflowRunJob[]> {
  const repository = getRequiredEnv("REPO");
  const perPage = 100;
  const maxPages = 20;
  const jobs: WorkflowRunJob[] = [];

  for (let page = 1; page <= maxPages; page += 1) {
    const response = await githubRequest<WorkflowJobsResponse>(
      `/repos/${repository}/actions/runs/${runId}/jobs?per_page=${perPage}&page=${page}`,
    );
    jobs.push(...response.jobs);
    if (response.jobs.length < perPage) {
      return jobs;
    }
  }

  throw new Error(
    `Exceeded workflow job pagination limit of ${maxPages} pages (${maxPages * perPage} jobs)`,
  );
}

async function listArtifactsForWorkflowRun(runId: string): Promise<Artifact[]> {
  const repository = getRequiredEnv("REPO");
  const perPage = 100;
  const maxPages = 20;
  const artifacts: Artifact[] = [];

  for (let page = 1; page <= maxPages; page += 1) {
    const response = await githubRequest<WorkflowRunArtifactsResponse>(
      `/repos/${repository}/actions/runs/${runId}/artifacts?per_page=${perPage}&page=${page}`,
    );
    artifacts.push(...response.artifacts);
    if (response.artifacts.length < perPage) {
      return artifacts;
    }
  }

  throw new Error(
    `Exceeded workflow artifact pagination limit of ${maxPages} pages (${maxPages * perPage} artifacts)`,
  );
}

function getSnapshotJobs(jobs: WorkflowRunJob[]): SnapshotJob[] {
  return jobs
    .filter((job) =>
      job.steps?.some((step) => step.name === "Upload snapshots"),
    )
    .map((job) => {
      const project = job.name.startsWith("Test ")
        ? job.name.slice(5).toLowerCase()
        : undefined;
      return {
        name: job.name,
        project,
      };
    });
}

async function checkArtifacts(): Promise<void> {
  const runId = getRequiredEnv("RUN_ID");
  const jobs = await listJobsForWorkflowRun(runId);
  const artifacts = await listArtifactsForWorkflowRun(runId);
  const snapshotJobs = getSnapshotJobs(jobs);
  const invalidSnapshotJobs = snapshotJobs.filter((job) => !job.project);
  const expectedSnapshotArtifacts = snapshotJobs.flatMap((job) => {
    if (!job.project) {
      return [];
    }
    return [`app-visual-${job.project}`];
  });
  const snapshotArtifacts = artifacts
    .map((artifact) => artifact.name)
    .filter((artifact) => artifact.startsWith("app-visual-"));
  const missingSnapshotArtifacts = expectedSnapshotArtifacts.filter(
    (artifact) => !snapshotArtifacts.includes(artifact),
  );
  const hasCompleteSnapshots =
    invalidSnapshotJobs.length === 0 &&
    expectedSnapshotArtifacts.length > 0 &&
    missingSnapshotArtifacts.length === 0;

  if (invalidSnapshotJobs.length > 0) {
    console.log(
      `Unexpected snapshot job names: ${invalidSnapshotJobs.map((job) => job.name).join(", ")}`,
    );
  }
  console.log(
    `Expected snapshot artifacts: ${expectedSnapshotArtifacts.join(", ") || "(none)"}`,
  );
  console.log(
    `Found snapshot artifacts: ${snapshotArtifacts.join(", ") || "(none)"}`,
  );
  if (missingSnapshotArtifacts.length > 0) {
    console.log(
      `Missing snapshot artifacts: ${missingSnapshotArtifacts.join(", ")}`,
    );
  }
  setOutput("ready", String(hasCompleteSnapshots));
}

function prepareScreenshots(): void {
  const sourceDir = path.join(getRepositoryRoot(), "pr", "site", "src");
  const screenshotDirectories = findPaths(
    sourceDir,
    (entryPath, isDirectory) => {
      return isDirectory && path.basename(entryPath) === "__screenshots__";
    },
  );
  removePaths(screenshotDirectories);
}

function extractSnapshots(): void {
  const artifactsDir = getRequiredEnv("ARTIFACTS_DIR");
  const repoRoot = getRepositoryRoot();
  const archives = findPaths(artifactsDir, (entryPath, isDirectory) => {
    if (isDirectory) {
      return false;
    }
    return /^app-visual-.*\.tar\.gz$/.test(path.basename(entryPath));
  });

  for (const archive of archives) {
    runCommand("tar", ["-xzf", archive, "-C", path.join(repoRoot, "pr")]);
  }
}

const command = process.argv[2];

if (command === "check-artifacts") {
  await checkArtifacts();
} else if (command === "prepare-screenshots") {
  prepareScreenshots();
} else if (command === "extract-snapshots") {
  extractSnapshots();
} else {
  throw new Error(`Unknown command: ${command}`);
}
