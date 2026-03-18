---
name: review-github-pr
description: Address review comments on a GitHub pull request. Use when the user asks to review, address, fix, or resolve PR comments, or references a GitHub PR URL with review feedback to handle.
---

# Review GitHub PR Comments

Process for triaging and resolving review comments left by bots or humans on a GitHub pull request.

## 1. Fetch review threads via GraphQL

Use the GraphQL API to fetch all review threads, including their resolution status and comments. The REST review-comment endpoints expose individual comments and replies, but not whether a thread is currently resolved, so GraphQL is the reliable source for thread resolution state.

```sh
gh api graphql -f query='
  query($owner: String!, $name: String!, $pr: Int!) {
    repository(owner: $owner, name: $name) {
      pullRequest(number: $pr) {
        reviewThreads(first: 100) {
          nodes {
            isResolved
            resolvedBy { login }
            path
            line
            startLine
            comments(first: 20) {
              nodes {
                databaseId
                author { login }
                body
                url
              }
            }
          }
        }
      }
    }
  }
' -f owner=OWNER -f name=REPO -F pr=NUMBER
```

- **Skip resolved threads entirely** (`isResolved == true`). These have already been addressed — do not fix or reply to them.
- For unresolved threads, the first comment in each thread is the top-level review comment. Subsequent comments are replies.
- Group unresolved top-level comments by file and line.

## 2. Triage each unresolved comment

For every top-level comment in an unresolved thread, determine its status:

1. **Already resolved in code** — The issue described in the comment has already been fixed in a later commit. Reply confirming which commit resolved it and move on.
2. **Valid and unresolved** — The issue is legitimate and still present in the code. Proceed to fix it.
3. **Invalid or inaccurate** — The reviewer's analysis is wrong (e.g., misreading the code, suggesting a fix for something that isn't broken, or flagging idiomatic patterns as errors). Reply explaining why the comment doesn't apply and move on.

### Verification checklist

- **Read the current code** at the referenced file and line before deciding. The comment may reference an older commit — check whether the issue still exists after subsequent commits.
- **Do not blindly trust suggestions.** Both bots (Copilot, CodeRabbit, etc.) and human reviewers (including the PR author) can produce inaccurate analysis. Verify every claim against the actual code.
- **Come up with your own solution first** if the issue is valid. Then compare it with the reviewer's suggestion, adopt it only if it's better, or use it to refine your solution.

## 3. Fix valid comments

- Group related fixes into logical commits (e.g., all JSON-safety fixes in one commit, all dependency-tracking fixes in another).
- If the original PR is already merged and a valid unresolved comment still requires code changes, create a new follow-up branch and open a new PR for the fix. Do not try to amend the merged PR.
- After each fix, run the relevant verification commands (see the `ariakit-workflow` skill) to confirm correctness.
- Commit with a clear message describing what was fixed and why.

## 4. Reply to every unresolved comment

Every top-level comment in an unresolved thread must get a reply, regardless of status:

- **Resolved in code:** "Resolved in {commit_sha} — {brief description of what was fixed}."
- **Fixed now:** "Fixed in {commit_sha} — {brief description}."
- **Fixed in follow-up PR:** "Fixed in {commit_sha} via follow-up PR #{pr_number} — {brief description}."
- **Invalid:** "This is not an issue because {explanation}." Be specific and cite the relevant code behavior.

- Keep a short record of the outcome for each thread while replying so you can summarize everything in one top-level PR comment afterward.

## 5. Push

Push all fix commits at once after all comments have been addressed.

## 6. Post a top-level PR summary comment

After all unresolved threads have replies and any new commits are pushed, post a regular comment on the PR itself summarizing the overall outcome:

- List the fixes that were made, with commit SHAs when relevant.
- Mention comments that were already resolved in code before you started.
- Mention comments that were invalid and summarize why they did not require changes.
- Mention any follow-up PRs if work had to move out of the current PR.

Keep this comment concise and scannable. Prefer a short heading plus bullets for `fixed`, `already resolved`, `invalid`, and `follow-up` when those categories apply.
