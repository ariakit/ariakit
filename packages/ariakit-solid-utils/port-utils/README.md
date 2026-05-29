# Port-status / dependency-analysis scripts

Dev-only tooling for tracking the React -> Solid port. These scripts scan the
React and Solid component packages and report which components/sub-components
have been ported, dependency/dependent graphs, dependency counts, and example
test coverage.

These live here (outside `src/`) so they are not built, type-checked, or
published as part of `@ariakit/solid-utils`. This is a temporary home while the
Solid port is in progress.

## Requirements: Bun

These scripts are written for **Bun**, not plain Node. They import from `bun`
(`Bun.argv`, `Bun.file`, the `$` shell helper, and `color`) and are intended to
be run directly with Bun:

```sh
bun packages/ariakit-solid-utils/port-utils/status.ts
bun packages/ariakit-solid-utils/port-utils/test-status.ts
bun packages/ariakit-solid-utils/port-utils/deps.ts <component[/subcomponent]>
bun packages/ariakit-solid-utils/port-utils/dependents.ts <component[/subcomponent]>
bun packages/ariakit-solid-utils/port-utils/dep-counts.ts
bun packages/ariakit-solid-utils/port-utils/dependents-count.ts
```

## Notes

- Path constants were updated for main's package layout: the React side now
  points at `packages/ariakit-react-components/src` and the Solid side at
  `packages/ariakit-solid-components/src`.
- The status comparison assumes the OLD single `ariakit-solid-core` layout. On
  main the Solid code is split across `ariakit-solid-components`,
  `ariakit-solid-utils`, and `ariakit-solid-store`; these scripts currently only
  scan `ariakit-solid-components`. Broadening the Solid scan (and a Bun -> Node
  port) is a sensible follow-up.
- Known pre-existing issue (carried over verbatim from the original branch):
  `dependents-count.ts` derives the "ported" numerator from a component's
  dependencies (`getDeps`/`getResolvedDeps`) while the total comes from
  `getDependentCounts`, so the printed `ported/total` figure can be misleading.
  Worth fixing alongside the Bun -> Node port.
