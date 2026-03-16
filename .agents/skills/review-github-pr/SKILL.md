---
name: review-github-pr
description: Address review comments on a GitHub pull request. Use when the user asks to review, address, fix, or resolve PR comments, or references a GitHub PR URL with review feedback to handle.
---

# Review GitHub PR Comments

Process for triaging and resolving review comments left by bots or humans on a GitHub pull request.

## 1. Fetch all review comments

- Filter out replies (`in_reply_to_id != null`) — those are follow-ups, not top-level review comments.
- Group the remaining top-level comments by file and line.

## 2. Triage each comment

For every top-level comment, determine its status:

1. **Already resolved** — The issue described in the comment has already been fixed in a later commit. Reply confirming which commit resolved it and move on.
2. **Valid and unresolved** — The issue is legitimate and still present in the code. Proceed to fix it.
3. **Invalid or inaccurate** — The bot's analysis is wrong (e.g., misreading the code, suggesting a fix for something that isn't broken, or flagging idiomatic patterns as errors). Reply explaining why the comment doesn't apply and move on.

### Verification checklist

- **Read the current code** at the referenced file and line before deciding. The comment may reference an older commit — check whether the issue still exists after subsequent commits.
- **Do not blindly trust bot suggestions.** Bots (Copilot, CodeRabbit, etc.) frequently produce inaccurate analysis. Verify every claim against the actual code.
- **Come up with your own solution first** if the issue is valid. Then compare it with the bot's suggestion, adopt it only if it's better, or use it to refine your solution.

## 3. Fix valid comments

- Group related fixes into logical commits (e.g., all JSON-safety fixes in one commit, all dependency-tracking fixes in another).
- After each fix, run the relevant verification commands (see the `ariakit-workflow` skill) to confirm correctness.
- Commit with a clear message describing what was fixed and why.

## 4. Reply to every comment

Every top-level comment must get a reply, regardless of status:

- **Resolved:** "Resolved in {commit_sha} — {brief description of what was fixed}."
- **Fixed now:** "Fixed in {commit_sha} — {brief description}."
- **Invalid:** "This is not an issue because {explanation}." Be specific and cite the relevant code behavior.

Use the GitHub API to post replies.

## 5. Push

Push all fix commits at once after all comments have been addressed:

```sh
git push
```
