---
name: github-cli
description: Guidelines for posting content to GitHub via the gh CLI or GitHub API. Use when creating or updating PRs, issues, or comments through gh commands.
---

# GitHub CLI

- Always use a single-quoted HEREDOC (`<<'EOF'`) to pass multi-line Markdown bodies to `gh pr create`, `gh pr edit`, `gh issue create`, or `gh api`. The single quotes prevent the shell from interpolating variables or backticks inside the body, so **never escape backticks, quotes, or other Markdown characters** — escaping them produces literal backslashes in the rendered Markdown.
- Prefer `gh pr edit --body` or `gh pr create --body` over raw `gh api` calls when possible, since they handle encoding automatically.
