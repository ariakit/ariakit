## Cursor Cloud specific instructions

This is a multi-repo workspace with three repos under `/agent/repos/`:

| Repo      | Purpose                                                 | Dev server                                         |
| --------- | ------------------------------------------------------- | -------------------------------------------------- |
| `ariakit` | Accessible React/Solid UI component library + docs site | `pnpm dev-site` (Astro on :4321, Next.js on :3000) |
| `clava`   | Class/style variant library                             | `cd app && pnpm dev` (Vite on :5173)               |
| `skills`  | Shared AI agent skills (CLI tooling)                    | No server needed                                   |

### Node & package manager

All repos require **Node 24** (`.nvmrc`) and **pnpm** (`packageManager` field — v11.1.1 for ariakit/clava, v11.1.0 for skills). Use `nvm use 24` if not already active.

### Key commands (per repo)

**ariakit:**

- Lint: `pnpm lint` (oxlint + oxfmt; warnings for `no-underscore-dangle` are expected)
- CSS lint: `pnpm lint-css`
- Test: `pnpm test --run` (vitest, 148 test files)
- Type-check: `pnpm tsc`
- Build packages: `pnpm build`
- Dev site: `pnpm dev-site` — starts Astro docs site (:4321) + Next.js companion (:3000)
- Dev site (faster): `pnpm dev-site-lite` — disables syntax highlighting

**clava:**

- Lint: `pnpm lint` (oxlint with `--type-aware --type-check` + oxfmt)
- Test: `pnpm test --run` (vitest, 16 test files)
- Build: `pnpm build`
- Demo app: `cd app && pnpm dev` (Vite on :5173)

**skills:**

- Lint: `pnpm lint`
- Test: `pnpm test` (vitest run, 3 test files)

### Gotchas

- The ariakit site homepage (`/`) intentionally shows "Soon" — it's a placeholder landing page. Use `/playground` to verify the dev server is working interactively.
- Component/example pages use dynamic content-collection routes (`[...component].astro`, `[...example].astro`). Routes like `/examples/dialog` don't exist — the content determines available paths.
- Clerk auth and Stripe integrations degrade gracefully when env vars are absent. No secrets are required for local development.
- The ariakit monorepo uses `pnpm workspaces` (no Turborepo/Nx). Building packages first (`pnpm build`) is needed before the site can reference them.
- The `prepare` script runs `husky` for git hooks. lint-staged config is in root `package.json`.
