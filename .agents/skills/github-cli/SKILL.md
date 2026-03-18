---
name: github-cli
description: Guidelines for posting content to GitHub via the gh CLI or GitHub API. Use when creating or updating PRs, issues, or comments through gh commands.
---

# GitHub CLI

- When passing a `--body` or similar Markdown argument to `gh pr create`, `gh pr edit`, `gh issue create`, or `gh api`, **never escape backticks, quotes, or other Markdown characters**. The shell HEREDOC already protects them from interpretation. Escaping backticks (e.g., writing `\`code\``) produces literal backslashes in the rendered Markdown.
- Always use a single-quoted HEREDOC (`<<'EOF'`) to pass multi-line Markdown bodies. The single quotes prevent the shell from interpolating variables or backticks inside the body.
- In this repo, `gh pr edit --body` fails with a "Projects (classic)" GraphQL deprecation error. Always use `gh api` with `-f body=` for updating PR descriptions. When using `gh api -f body=`, the value is sent as-is (no shell expansion inside a single-quoted HEREDOC), so Markdown formatting is preserved without escaping.
- Correct pattern: `gh api repos/OWNER/REPO/pulls/NUMBER -X PATCH -f body="$(cat <<'EOF' ... EOF )"` where the body between `EOF` markers contains raw Markdown with unescaped backticks, code fences, etc.
- Never manually escape backticks with `\` when the value is inside a HEREDOC. The HEREDOC handles quoting.
