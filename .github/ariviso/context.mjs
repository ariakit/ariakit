import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const settings = JSON.parse(
  await readFile(new URL("settings.json", import.meta.url), "utf8"),
);
const origin = new URL(settings.server).origin;
const request = new URL(process.env.ACTIONS_ID_TOKEN_REQUEST_URL);
request.searchParams.set("audience", origin);
const response = await fetch(request, {
  headers: {
    Authorization: `Bearer ${process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN}`,
  },
  redirect: "error",
});
if (!response.ok) throw new Error(`OIDC request failed: ${response.status}`);
const { value } = await response.json();
// This only locates the current REST job. The server verifies the signed token.
const claims = JSON.parse(
  Buffer.from(value.split(".")[1], "base64url").toString(),
);
const runId = process.env.GITHUB_RUN_ID;
const attempt = Number(process.env.GITHUB_RUN_ATTEMPT);
const browser = process.env.ARIVISO_BROWSER;
const jobs = await fetch(
  `https://api.github.com/repos/${settings.repository}/actions/runs/${runId}/attempts/${attempt}/jobs?per_page=100`,
  {
    headers: {
      Authorization: `Bearer ${process.env.GH_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2026-03-10",
    },
    redirect: "error",
  },
);
if (!jobs.ok)
  throw new Error(`Cannot locate current workflow job: ${jobs.status}`);
const body = await jobs.json();
const matches = body.jobs.filter(
  (job) =>
    job.name === `capture / ${browser}` &&
    new URL(job.check_run_url).pathname.endsWith(`/${claims.check_run_id}`),
);
if (matches.length !== 1)
  throw new Error("Current signed workflow job is ambiguous or absent");
const context = {
  workflowRunId: runId,
  workflowAttempt: attempt,
  testedSha: process.env.GITHUB_SHA,
  jobId: String(matches[0].id),
};
await writeFile(
  path.join(process.env.GITHUB_WORKSPACE, "app/.ariviso-results/context.json"),
  `${JSON.stringify(context, null, 2)}\n`,
);
