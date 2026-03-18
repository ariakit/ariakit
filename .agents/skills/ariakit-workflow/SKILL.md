---
name: ariakit-workflow
description: Workflow instructions for this repository. Always use when planning or implementing changes.
---

# Ariakit Workflow

## General

- Whenever you learn something new worth noting about workflow or code standards, make sure to update the agent’s skills.
- Always edit skill files in `.agents/skills/`, not `.claude/skills/`. The latter is a symlink to the former, and editing through the symlink can cause issues with git operations.
- If a skill change updates code standards or formatting rules, apply the change across existing files in the repository so the codebase stays in sync with the skills.
- Add changesets in the `.changeset` folder for user-facing updates such as bug fixes, performance improvements, and new features. Refactors and other changes that do not affect shipped code should not require changesets.

## Worktrees

- Before creating a worktree (via `EnterWorktree` or `git worktree add`), always fetch the base branch from origin first so you start from the latest remote state:
  ```sh
  git fetch origin main
  ```
  Replace `main` with the actual base branch if it differs. This prevents starting work from a stale local branch.

## Dependencies

- Every workspace must declare the dependencies it actually uses in its own `package.json`. Do not rely on hoisting from the root.
- When adding a new import of an external package to a workspace, add that package to the workspace's `package.json` (`dependencies` for prod, `devDependencies` for types and test/build tools).
- The root `package.json` should only contain `devDependencies` used by root-level code (scripts in `scripts/`, config files like `vitest.config.ts`, `playwright.config.ts`, `postcss.config.cjs`, `tailwind.config.cjs`, and CLI tooling like `oxlint`, `oxfmt`, `changesets`, `husky`, etc.) plus `next` which Vercel requires in the root for framework detection.
- For published packages (`packages/*`): prod dependencies use caret ranges (e.g., `^1.0.0`), dev dependencies use exact versions (e.g., `1.0.0`).
- For private workspaces and root: all dependencies (prod and dev) use exact versions with no caret.
- Internal workspace references always use `workspace:*`.
- `@types/*` packages are normally `devDependencies`. The exception is when a published package re-exports types from a `@types/*` package in its public API — in that case it must be a prod dependency so consumers get the types.
- When removing an import, check if the dependency is still used elsewhere in the workspace. Remove it from `package.json` if no longer needed.

## Visual Tests

- Never take or update visual screenshots locally unless it's for debugging purposes. Screenshots are OS-dependent and will differ across machines. The `visual()` helper in `site/src/test-utils/visual.ts` enforces this by requiring both `VISUAL_TEST=true` and `CI=true` to capture screenshots.
- Do not run visual test scripts (`test-visual*`) or set `VISUAL_TEST=true` locally — those are meant for CI only.
- Most tests tagged `@visual` can run locally without `VISUAL_TEST` — they just skip the screenshot step. However, some suites (e.g., `previews-browser.ts`) skip execution entirely without `VISUAL_TEST`, so not all `@visual` tests will run locally.

## Verification

- If local commands fail because workspace dependencies or CLIs are missing,
  run `pnpm install` from the repository root before other verification steps.
- After making changes, run the relevant checks before finishing the task.
- Run `pnpm tsc` from the repository root when you change TypeScript code or anything else that could affect TypeScript behavior, including dependencies and shared configs.
- Run `pnpm test` from the repository root when you change code covered by the root Vitest suite.
- Run `pnpm dev-site` from the repository root to manually test site-impacting changes, even when the changed files live outside the `site` workspace.
- Run `pnpm -F site test` from the repository root when your changes affect behavior covered by the browser tests in the `site` workspace. Consider this for cross-workspace changes too, not only edits inside `site`.
- Run `pnpm build` from the repository root when your changes could affect the published packages or their build output.
- Run `pnpm build-site-lite` from the repository root when your changes might affect the final site build and aren't caught by `pnpm dev-site`. You can use `pnpm preview-site-lite` to run it on a local Cloudflare server.
- Avoid `pnpm build-site` (the full version) unless you need to debug something that's only triggered by the full site build.
