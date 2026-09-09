# Site reimplementation handoff

The app is reduced to a small site scaffold before the `@ariakit/ui` branch merges. Rebuild the site with the new package patterns. These documents record behavior to consider for that work; they do not require the old component structure, styles, or implementation.

- [Reference documentation, code highlighting, and hovercards](reference-and-code.md)
- [Markdown, scrolling, placeholders, portals, online editors, and tags](content-and-interaction.md)
- [Accounts, teams, checkout, and administration](accounts.md)

The historical source is available at [`73d5c8645`](https://github.com/ariakit/ariakit/commit/73d5c8645458823366c7163446a9211128cf4cae). Each handoff identifies its source files, behavior, acceptance scenarios, and known limits. Use Better Auth for the future account implementation. Do not restore Clerk.

## Read archived source

The snapshot belongs to [PR #5240](https://github.com/ariakit/ariakit/pull/5240). It includes app changes that are absent from the PR's base on `main`. A fresh clone after a squash merge does not include those intermediate commits. Fetch the pull request history before reading the snapshot:

```sh
git fetch origin pull/5240/head
git show 73d5c8645458823366c7163446a9211128cf4cae:app/src/lib/auth.ts
```

These commands assume `origin` points to `https://github.com/ariakit/ariakit.git`. Replace the file path to read another archived source.

## Retained scaffold

Keep all sandboxes, icons, guides, the Ariakit UI demo, preview generation and hydration, API routes, reference partials, and OG image routes. The remaining app samples are Separator for React and Solid, Combobox Group for React, and its Custom Items variant. The legacy `website`, root `examples`, and `nextjs` fixtures remain separate from this app cleanup.

Collection, component, example, and guide pages retain content loading and basic navigation. The layout has no site design. Reference output uses plain text, code, and links. Sample output shows the preview and expandable source files. Code highlighting, reference hovercards, online editing, tag navigation, and the account UI can be implemented later from these handoffs.

Guides keep their existing links, including links to removed app pages, for the later site rewrite. Do not treat those links as proof that a route remains available.

The Stripe webhook continues to validate signatures and update price and public promotion caches. Events that need account fulfillment return a retryable service-unavailable error. Existing Stripe and KV records must remain intact. The account handoff describes migration and event recovery requirements before the next launch.

## Supporting libraries

All `preview-*` modules stay. They define preview roots, discover framework entry files, generate preview modules, integrate them with Astro, list previews for tests, and report hydration readiness. `preview-framework.astro` and both framework hydration components are required by generated previews.

Keep `collection-cache`, `thumbnail`, and `use-controllable-state` as building blocks for the rewrite, even while they have no callers in the reduced site.

The framework and path modules use singular names. OG image keys and paths share `og-image.ts`. Source collection and its Vite plugin share `source.ts`. Shared UI CSS lives in `packages/ariakit-ui/src/styles/ui.css`; app global CSS retains only the required preview foundation.

The references content collection and JSDoc loader stay. The removed `/jsdoc` endpoint only returned a JSON list of reference URLs and had no repository consumer. Its removal does not remove reference extraction.
