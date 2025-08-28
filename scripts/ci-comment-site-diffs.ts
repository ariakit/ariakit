#!/usr/bin/env node --experimental-strip-types
import fs from "node:fs";
import path from "node:path";
import { Octokit } from "@octokit/rest";

interface DiffFile {
  base?: string;
  actual: string;
  diff?: string;
  kind: "changed" | "new";
}
interface DiffSummary {
  byTest: Record<string, DiffFile[]>;
}

function env(name: string, required = true) {
  const v = process.env[name];
  if (!v && required) throw new Error(`Missing env: ${name}`);
  return v ?? "";
}

function readSummary(file: string): DiffSummary {
  const json = fs.readFileSync(file, "utf8");
  return JSON.parse(json) as DiffSummary;
}

function relativeFromRepo(p: string) {
  return path.relative(process.cwd(), p);
}

function renderTable(summary: DiffSummary) {
  const rows: string[] = [];
  const pageUrl = process.env.PAGE_URL || "";
  const pageUrlTrimmed = pageUrl.replace(/\/$/, "");
  rows.push(
    "<details><summary><strong>Visual diffs detected</strong> — review and approve if expected</summary>\n\n",
  );
  if (pageUrl) {
    rows.push(
      `View images on Pages: <a href="${pageUrl}">visual diffs</a>\n\n`,
    );
  }
  rows.push(
    "To update the baseline snapshots, either: (1) add a PR comment containing <code>Approve app visual</code>, or (2) push an empty commit with message <code>chore(site): approve app visual</code>. Option (2) will rerun tests with -u and commit updated snapshots automatically.\n\n",
  );
  rows.push(
    "<table><thead><tr><th>Baseline</th><th>New</th><th>Diff</th></tr></thead><tbody>",
  );
  for (const [suite, files] of Object.entries(summary.byTest)) {
    rows.push(`<tr><td colspan=3><strong>${suite}</strong></td></tr>`);
    for (const f of files) {
      const base = f.base
        ? pageUrl
          ? `${pageUrlTrimmed}/${f.base}`
          : relativeFromRepo(f.base)
        : "";
      const actual = pageUrl
        ? `${pageUrlTrimmed}/${f.actual}`
        : relativeFromRepo(f.actual);
      const diff = f.diff
        ? pageUrl
          ? `${pageUrlTrimmed}/${f.diff}`
          : relativeFromRepo(f.diff)
        : "";
      rows.push(
        `<tr><td>${base ? `<img alt="baseline" src="${base}"/>` : "(none)"}</td><td><img alt="new" src="${actual}"/></td><td>${diff ? `<img alt="diff" src="${diff}"/>` : "(none)"}</td></tr>`,
      );
    }
  }
  rows.push("</tbody></table>\n\n</details>");
  return rows.join("\n");
}

async function upsertComment(
  octokit: Octokit,
  owner: string,
  repo: string,
  issue: number,
  body: string,
) {
  const { data: comments } = await octokit.issues.listComments({
    owner,
    repo,
    issue_number: issue,
    per_page: 100,
  });
  const marker = "<!-- site-visual-diffs -->";
  const existing = comments.find((c) => c.body?.includes(marker));
  const finalBody = `${marker}\n${body}`;
  if (existing) {
    await octokit.issues.updateComment({
      owner,
      repo,
      comment_id: existing.id,
      body: finalBody,
    });
  } else {
    await octokit.issues.createComment({
      owner,
      repo,
      issue_number: issue,
      body: finalBody,
    });
  }
}

async function isApprovedCommentPresent(
  octokit: Octokit,
  owner: string,
  repo: string,
  issue: number,
) {
  const { data: comments } = await octokit.issues.listComments({
    owner,
    repo,
    issue_number: issue,
    per_page: 100,
  });
  return comments.some((c) => /approve app visual/i.test(c.body || ""));
}

async function main() {
  const token = env("GITHUB_TOKEN");
  const owner = env("GITHUB_REPOSITORY_OWNER");
  const [_, repo] = env("GITHUB_REPOSITORY").split("/");
  const prNumberEnv = env("PR_NUMBER", false);
  const summaryPath = process.argv[2] || "site-diff-summary.json";

  // Read summary if present; otherwise proceed without it
  let summary: DiffSummary = { byTest: {} };
  if (fs.existsSync(summaryPath)) {
    summary = readSummary(summaryPath);
  }

  const hasDiffs = Object.keys(summary.byTest).length > 0;
  const body = hasDiffs ? renderTable(summary) : "";
  const octokit = new Octokit({ auth: token });

  const eventName = env("GITHUB_EVENT_NAME");

  // Handle issue_comment: only detect approval and expose flag
  if (eventName === "issue_comment") {
    const payloadPath = env("GITHUB_EVENT_PATH");
    const payload = JSON.parse(fs.readFileSync(payloadPath, "utf8"));
    const issue_number = payload.issue.number as number;
    const approved = await isApprovedCommentPresent(
      octokit,
      owner,
      repo!,
      issue_number,
    );
    process.stdout.write(`APP_VISUAL_APPROVED=${approved ? "true" : "false"}`);
    return;
  }

  // If PR_NUMBER is explicitly provided (e.g., from workflow_run), use it
  if (prNumberEnv) {
    const issue_number = Number(prNumberEnv);
    if (hasDiffs) {
      await upsertComment(octokit, owner, repo!, issue_number, body);
    }
    return;
  }

  if (eventName === "pull_request" || eventName === "pull_request_target") {
    const payloadPath = env("GITHUB_EVENT_PATH");
    const payload = JSON.parse(fs.readFileSync(payloadPath, "utf8"));
    const issue_number = payload.pull_request.number as number;

    // If an approval comment is present, expose it via stdout for the workflow to proceed
    const approved = await isApprovedCommentPresent(
      octokit,
      owner,
      repo!,
      issue_number,
    );
    process.stdout.write(`APP_VISUAL_APPROVED=${approved ? "true" : "false"}`);
    if (hasDiffs) {
      await upsertComment(octokit, owner, repo!, issue_number, body);
    }
    return;
  }

  // Fallback to commit comment on push
  const sha = env("GITHUB_SHA");
  await octokit.repos.createCommitComment({
    owner,
    repo: repo!,
    commit_sha: sha,
    body,
  });
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
