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

## Bug Reports

- Start by reproducing the bug in a sandbox in the `site` workspace and add an automated test that fails for the reported behavior. Most bug reports include a StackBlitz URL with the user's reproduction. You should always open that URL and review the code for reference. At this point, you should commit your changes and create a draft PR so we can see the failed CI checks. Then start working on the workaround.
- If you need to adjust the tests later because they weren't accurate, make sure they fail without any workaround or library fix applied. Push that so we can validate it in CI, then reapply the workaround or library fix and keep going.
- All bug report investigations should produce a workaround before any library fix is proposed or implemented.
- Keep the library code unchanged while investigating the workaround. The workaround should be demonstrated first in userland code.
- Workarounds should follow the repository pattern: prefer a small consumer-side change that users can apply in their own app, such as an explicit prop override, a local event handler, a store method call, or a more specific callback condition.
- A workaround must preserve the user-facing features that motivated the bug report whenever possible. Do not remove components or disable behavior unless that tradeoff is explicitly unavoidable and clearly stated.
- Validate the workaround in the same repro sandbox by updating the userland code until the previously failing test passes.
- Once the workaround is in place, push the changes, with the workaround applied to the sandbox, to the PR so we can see the CI checks pass, and update the PR description with a "Workaround" section. The section should explain the problem and the workaround itself. It should also include a code block with the workaround applied. It doesn't need to be the full code, just the necessary snippet so the user can understand it and apply it to their own code before we make a release. Make sure to include a short `TODO` comment in the code block with the GitHub issue URL so it's clear the code is temporary and can be removed once the fix lands.
- After that, revert the workaround and start working on the proper library fix. Once it's fixed, update the PR description with the final explanation of the problem and the solution. The workaround section must stay. Push the changes and mark the PR ready for review.
