#!/usr/bin/env node --experimental-strip-types
import fs from "node:fs";
import path from "node:path";
import { Octokit } from "@octokit/rest";
import type { DiffSummary } from "./collect-visual-diffs.ts";

const MARKER = "<!-- app-visual-diffs -->";

function env(name: string, required = true) {
  const v = process.env[name];
  if (!v && required) {
    throw new Error(`Missing env: ${name}`);
  }
  return v ?? "";
}

function readSummary(file: string): DiffSummary {
  const json = fs.readFileSync(file, "utf8");
  return JSON.parse(json);
}

function labelFromPath(p: string) {
  if (!p) return "";
  const base = path.basename(p);
  return base.replace(/-(expected|actual|diff)\.png$/i, "");
}

function renderContent(summary: DiffSummary) {
  const rows: string[] = [];
  const entries = Object.entries(summary.byTest);
  const total = entries.reduce((acc, [, files]) => acc + files.length, 0);

  rows.push("## Visual regression tests\n");

  if (!total) {
    rows.push("✅ No visual diffs detected.");
    return rows.join("\n");
  }

  rows.push(
    "To update the baseline snapshots, push a commit whose message contains <code>[approve-visual]</code>.\n",
  );
  rows.push("Run this locally on your PR branch:\n");
  rows.push("```bash");
  rows.push('git commit --allow-empty -m "[approve-visual]" && git push\n');
  rows.push("```\n");

  const pageUrl = env("PAGE_URL").replace(/\/$/, "");
  rows.push(
    `<details><summary><strong>${total} visual diff${total === 1 ? "" : "s"} detected</strong></summary>\n\n`,
  );
  rows.push(
    "<table><thead><tr><th>Baseline</th><th>Actual</th><th>Diff</th></tr></thead><tbody>",
  );
  for (const [suite, files] of entries) {
    // Keep suite header for grouping
    rows.push(
      `<tr><td colspan=3 align=center><strong>${suite}</strong></td></tr>`,
    );
    for (const f of files) {
      const base = f.base ? `${pageUrl}/${f.base}` : "";
      const diff = f.diff ? `${pageUrl}/${f.diff}` : "";
      const actual = f.actual ? `${pageUrl}/${f.actual}` : "";
      const title = labelFromPath(f.diff || f.actual || f.base || "");
      // Per-file title row
      rows.push(`<tr><td colspan=3 align=center><em>${title}</em></td></tr>`);
      rows.push(
        `<tr><td>${base ? `<img alt="baseline" src="${base}"/>` : "—"}</td><td>${actual ? `<img alt="actual" src="${actual}"/>` : "—"}</td><td>${diff ? `<img alt="diff" src="${diff}"/>` : "—"}</td></tr>`,
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
  const existing = comments.find((c) => c.body?.includes(MARKER));
  const finalBody = `${MARKER}\n\n${body}`;
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

  const hasRows = Object.values(summary.byTest || {}).some((l) => l.length);
  const body = hasRows ? renderContent(summary) : "";
  const octokit = new Octokit({ auth: token });

  const eventName = env("GITHUB_EVENT_NAME");

  // If PR_NUMBER is explicitly provided (e.g., from workflow_run), use it
  if (prNumberEnv) {
    const issue_number = Number(prNumberEnv);
    if (hasRows) {
      await upsertComment(octokit, owner, repo!, issue_number, body);
    }
    return;
  }

  if (eventName === "pull_request" || eventName === "pull_request_target") {
    const payloadPath = env("GITHUB_EVENT_PATH");
    const payload = JSON.parse(fs.readFileSync(payloadPath, "utf8"));
    const issue_number = payload.pull_request.number as number;
    if (hasRows) {
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
