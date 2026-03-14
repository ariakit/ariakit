import { githubRequest } from "./lib/github.ts";
import { getRequiredEnv, setOutput } from "./lib/workflow.ts";

interface CommitResponse {
  sha: string;
}

async function readTipSha(): Promise<void> {
  const headRepo = getRequiredEnv("HEAD_REPO");
  const headBranch = encodeURIComponent(getRequiredEnv("HEAD_BRANCH"));
  const response = await githubRequest<CommitResponse>(
    `/repos/${headRepo}/commits/${headBranch}`,
  );
  setOutput("tip_sha", response.sha);
}

function compareTipSha(): void {
  const headSha = getRequiredEnv("HEAD_SHA");
  const tipSha = getRequiredEnv("TIP_SHA");
  setOutput("is_latest", String(headSha === tipSha));
}

const command = process.argv[2];

if (command === "read-tip-sha") {
  await readTipSha();
} else if (command === "compare-tip-sha") {
  compareTipSha();
} else {
  throw new Error(`Unknown command: ${command}`);
}
