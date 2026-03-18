---
name: ariakit-workflow
description: Workflow instructions for this repository. Always use when planning or implementing changes.
---

# Ariakit Workflow

## General

- Whenever you learn something new worth noting about workflow or code standards, make sure to update the agent’s skills.
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

- Never run visual tests locally (e.g., `pnpm -F site run test-visual` or any command that sets `VISUAL_TEST=true`). Visual screenshots are OS-dependent and will produce different results on different machines. They must only run on CI.
- The `visual()` helper in `site/src/test-utils/visual.ts` enforces this by requiring both `VISUAL_TEST=true` and `CI=true` to take screenshots.
- Tests tagged with `@visual` can still run locally without the `VISUAL_TEST` flag — they simply skip the screenshot step, which is valid for testing non-visual behavior.

## Verification

- If local commands fail because workspace dependencies or CLIs are missing,
  run `pnpm install` from the repository root before other verification steps.
- After making changes, run the relevant checks before finishing the task.
- Run `pnpm tsc` from the repository root when you change TypeScript code or anything else that could affect TypeScript behavior, including dependencies and shared configs.
- Run `pnpm test` from the repository root when you change code covered by the root Vitest suite.
- Run `pnpm dev-site` from the repository root to manually test site-impacting changes, even when the changed files live outside the `site` workspace.
- Run `pnpm -F site test` from the repository root when your changes affect behavior covered by the browser tests in the `site` workspace. Consider this for cross-workspace changes too, not only edits inside `site`.
- Run `pnpm build` from the repository root when your changes could affect the published packages or their build output.

## Bug Reports

- All bug report investigations should produce a workaround before any library fix is proposed or implemented.
- Start by reproducing the bug in a sandbox or example and add an automated test that fails for the reported behavior.
- If the user asks for a checkpoint, commit the failing repro state on a dedicated branch before continuing.
- Keep the library code unchanged while investigating the workaround. The workaround should be demonstrated first in userland code.
- Ariakit workarounds should follow the repository pattern: prefer a small consumer-side change that users can apply in their own app, such as an explicit prop override, a local event handler, a store method call, or a more specific callback condition.
- A workaround must preserve the user-facing features that motivated the bug report whenever possible. Do not remove components or disable behavior unless that tradeoff is explicitly unavoidable and clearly stated.
- Validate the workaround in the same repro sandbox by updating the userland code until the previously failing test passes.
- When applying a workaround in a sandbox or example, add a short `TODO` comment with the GitHub issue URL so it is clear that the code is temporary and can be removed after the fix lands.
