---
name: ariakit-changesets
description: Changeset authoring instructions for this repository. Use when creating or editing .changeset files.
---

# Ariakit Changesets

- Use a `kebab-case.md` filename that clearly relates to the change.
- While the package is in `v0`, mark minor and patch-level changes as `patch`, and mark major changes as `minor`. This only affects the change type in the frontmatter. The description should still accurately explain what changed (do not disguise features as bug fixes). For breaking changes, be sure to call them out and include before-and-after examples.
- Add a blank line between the frontmatter block and the description body.
- Keep each changeset file as a single changelog entry in one continuous description block (not one separate entry per paragraph).
- Use the first paragraph as a short past-tense summary sentence ending with a period (ideally one sentence).
- Write user-facing changelog copy; avoid mentioning internal implementation details (for example, function names or private helpers).
- When mentioning public APIs in the description, link to the Ariakit reference docs with Markdown links, for example: ``[`MenuItemRadio`](https://ariakit.org/reference/menu-item-radio)``.
- For consumer-facing bug fixes/features that patch `@ariakit/core`, `@ariakit/react-core`, or `@ariakit/solid-core` and are re-exported by dependent packages, include the affected dependents in frontmatter too (for example, `@ariakit/react-core` changes should also include `@ariakit/react`, and `@ariakit/solid-core` changes should also include `@ariakit/solid`).
- When needed, add other paragraphs with natural-language present-tense details and code examples (especially for new features).
- Prefer TypeScript code examples.
- It’s okay to create multiple changeset files for a single pull request when it includes separate changes that need to be described differently.
