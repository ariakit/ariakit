import { createCommitStatus } from "./lib/github.ts";
import { getRequiredEnv, setOutput } from "./lib/workflow.ts";

function checkRepo(): void {
  const headRepo = getRequiredEnv("HEAD_REPO");
  const repository = getRequiredEnv("REPO");
  setOutput("same_repo", String(headRepo === repository));
}

function generateAlias(): void {
  const headBranch = getRequiredEnv("HEAD_BRANCH");
  const slug = headBranch
    .toLowerCase()
    .replaceAll(/[^a-z0-9-]+/g, "-")
    .replaceAll(/^-+|-+$/g, "");
  setOutput("slug", slug);
}

async function setPendingStatus(): Promise<void> {
  const serverUrl = getRequiredEnv("SERVER_URL");
  const repository = getRequiredEnv("REPO");
  const runId = getRequiredEnv("RUN_ID");
  const headSha = getRequiredEnv("HEAD_SHA");
  const sameRepo = getRequiredEnv("SAME_REPO") === "true";
  const runUrl = `${serverUrl}/${repository}/actions/runs/${runId}`;

  await createCommitStatus(repository, headSha, {
    context: "Preview (commit)",
    state: "pending",
    target_url: runUrl,
  });

  if (!sameRepo) {
    return;
  }

  await createCommitStatus(repository, headSha, {
    context: "Preview (branch)",
    state: "pending",
    target_url: runUrl,
  });
}

async function setResultStatus(): Promise<void> {
  const serverUrl = getRequiredEnv("SERVER_URL");
  const repository = getRequiredEnv("REPO");
  const runId = getRequiredEnv("RUN_ID");
  const headSha = getRequiredEnv("HEAD_SHA");
  const sameRepo = getRequiredEnv("SAME_REPO") === "true";
  const versionsSuccess = getRequiredEnv("VERSIONS_SUCCESS") === "true";
  const deploySuccess = getRequiredEnv("DEPLOY_SUCCESS") === "true";
  const deployUrl = process.env.DEPLOY_URL ?? "";
  const versionUrl = process.env.VERSION_URL ?? "";
  const alias = process.env.ALIAS_URL ?? "";
  const runUrl = `${serverUrl}/${repository}/actions/runs/${runId}`;
  const aliasUrl =
    alias && versionUrl
      ? versionUrl.replace(/^(https?:\/\/)[^-]+/, `$1${alias}`)
      : "";
  const commitTarget = versionsSuccess && versionUrl ? versionUrl : "";
  const branchTarget =
    versionsSuccess && aliasUrl
      ? aliasUrl
      : deploySuccess && deployUrl
        ? deployUrl
        : "";

  await createCommitStatus(repository, headSha, {
    context: "Preview (commit)",
    state: commitTarget ? "success" : "failure",
    target_url: commitTarget || runUrl,
  });

  if (!sameRepo) {
    return;
  }

  await createCommitStatus(repository, headSha, {
    context: "Preview (branch)",
    state: branchTarget ? "success" : "failure",
    target_url: branchTarget || runUrl,
  });
}

const command = process.argv[2];

if (command === "check-repo") {
  checkRepo();
} else if (command === "generate-alias") {
  generateAlias();
} else if (command === "set-pending-status") {
  await setPendingStatus();
} else if (command === "set-result-status") {
  await setResultStatus();
} else {
  throw new Error(`Unknown command: ${command}`);
}
