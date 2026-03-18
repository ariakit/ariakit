---
name: github-cli
description: Guidelines for posting content to GitHub via the gh CLI or GitHub API. Use when creating or updating PRs, issues, or comments through gh commands.
---

# GitHub CLI

- When passing a `--body` or similar Markdown argument to `gh pr create`, `gh pr edit`, `gh issue create`, or `gh api`, **never escape backticks, quotes, or other Markdown characters**. The shell HEREDOC already protects them from interpretation. Escaping backticks (e.g., `\`code\``) produces literal backslashes in the rendered Markdown.
- Always use a HEREDOC to pass multi-line Markdown bodies. Prefer the `gh pr create`/`gh pr edit` flags over `gh api` when possible, since they handle encoding automatically.
- In this repo, `gh pr edit --body` fails with a "Projects (classic)" GraphQL deprecation error. Always use `gh api` with `-f body=` for updating PR descriptions. When using `gh api -f body=`, the value is sent as-is (no shell expansion inside a single-quoted HEREDOC), so Markdown formatting is preserved without escaping.
- Example of correct usage:

  ````sh
  gh pr create --title "Fix bug" --body "$(cat <<'EOF'
  ## Summary

  Fixed `FormRadio` items registering to the wrong store.

  ```tsx
  <FormRadioGroup>
    <FormRadio name={form.names.color} value="red" />
  </FormRadioGroup>
  ````

  EOF
  )"

  ```

  ```

- Example of **incorrect** usage (do NOT do this):

  ```sh
  gh api repos/owner/repo/pulls/123 -X PATCH \
    -f body="Fixed \`FormRadio\` items inside \`TabPanel\`."
  ```
