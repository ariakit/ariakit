# Ariviso diagnostic capture

This executor captures the full existing `@visual` suite in Chromium and Firefox on Ubuntu 24.04, and WebKit on macOS 15. The existing required screenshot workflow and its WebP baselines remain active. Same-repository pull requests run an environment probe while automatic capture is disabled. Set `ARIVISO_DIAGNOSTIC_ENABLED=true` in repository variables to enable complete captures for push, same-repository pull requests, and merge queue events. Fork pull requests do not run this workflow.

Each visual test declares a stable item annotation. Keep that value when a test title changes:

```ts
test(
  "opens the success dialog @visual",
  {
    annotation: { type: "ariviso:item", description: "ui/dialog/open-success" },
  },
  async ({ page, visual }) => {
    // Prepare the page before calling the existing visual helper.
    await visual({ capture: "open" });
  },
);
```

Use an explicit `capture` key for each distinct state in the same item. Do not derive keys from labels, test titles, filenames, or capture order. The preview catalog uses its existing explicit preview identifier as the item key. The review list uses the complete item key as its label, so sections and previews remain distinguishable. Framework, browser, viewport, canvas style, color scheme, contrast, and forced colors form the variant key. Caller helpers prepare media, viewport, scrolling, pointer position, and the content clip before the adapter receives the page. The generic preview caller loads the page separately in each color scheme.

UI page captures declare each example article in `app/src/test-utils/ariviso-pages.ts`, with separate `key` and selector `title` fields. Keep the key when a heading changes, and update only its selector. Every declared article is captured independently; page height, row count, and responsive reflow cannot rename its capture. Missing, duplicate, and undeclared articles fail capture setup. Add a declaration deliberately when adding an example. The legacy screenshot workflow keeps its existing page and row grouping.

The adapter is loaded only when the immutable CI configuration sets `ARIVISO_CAPTURE=true`. Ordinary tests retain their current CI gate and screenshot assertion. Diagnostic captures use fresh PNG originals, and do not read, convert, update, or delete old WebP baselines.

## Bootstrap

1. Replace the service origin and the two package SHA-256 hashes in `settings.json`. Use reviewed tarballs of the public `@ariviso/playwright` adapter and `ariviso` CLI. Set their direct HTTPS download URLs in the repository secrets `ARIVISO_PLAYWRIGHT_TARBALL_URL` and `ARIVISO_CLI_TARBALL_URL`. Do not commit signed URLs. Refresh an expired URL without changing the reviewed package bytes or hashes. The workflow passes these secrets only to the capture package installation step; probe mode needs neither secret. Each archive is size-bounded and verified before the isolated executor installs it offline. Its committed lockfile pins Playwright 1.63.0 and the adapter's PNG dependency. The adapter and test runner use the same Playwright instance.
2. Commit the reviewed executor source and capture integration as commit A, excluding both workflow files while their pins are zero. Run `node .github/ariviso/pin.mjs source <A>` to set `ARIVISO_EXECUTOR_SOURCE`, then commit the reusable workflow as B. Run `node .github/ariviso/pin.mjs workflow <B>`, then commit the caller as C. The script only edits the selected local workflow file; it performs no Git or network action. The source pin and workflow pin are separate because a commit cannot contain its own SHA. Set the service's reusable workflow reference and SHA to B. Do not push the zero-SHA caller: GitHub may resolve reusable workflow references before evaluating a job condition.
3. Use the automatic probe from the setup pull request, or dispatch the diagnostic workflow on `main` with mode `probe` after it lands. GitHub requires the workflow file on the default branch before manual dispatch is available. Probe mode installs the locked executor runtime and runs all three browsers without taking screenshots, requesting a service identity token, downloading Ariviso packages, or uploading to the service. Download the three `ariviso-environment-*` artifacts. Each contains the actual runner image identity, system and app font content hashes, browser version, and measured environment profile digests. Pull request probes do not register a plan or authorize captures. Local probe output uses `local-probe-only` and must not be registered for hosted CI.
4. Check those measured profiles and copy their digest arrays into the matching browser keys in `environments.json`. The profile records include every explicit viewport in the capture callers, both color schemes, supported contrast and forced-color states, and the two full-page modes. Profile allowlists are trusted configuration. A candidate upload cannot extend them.
5. After copying the reviewed hosted profile digests, run `node .github/ariviso/plan.mjs`. This deliberately writes the complete trusted plan to `.github/ariviso-plan.json` and prints its plan and executor digests. The service reads that whole JSON document from trusted `main`; set `ARIVISO_TRUSTED_PLAN_PATH=.github/ariviso-plan.json`. Keep the generated file outside `.github/ariviso`, because the executor digest includes every `.mjs` and `.json` file in that directory. Review and commit the generated plan with the updated executor source. Then update both immutable workflow pins using the sequence in step 2. Register the matching plan digest, discovery executor digest, exact job names, and policy digest with the service. Register the `visible-exact-v1` policy only with the separately reviewed measurement decision.
6. Dispatch mode `capture`. The three jobs measure the runner again and reject an environment outside the registered allowlist before tests start. Check that the complete suite, uploads, receipt artifacts, service comparison, and fresh baseline review finish. Repeat on unchanged content to measure drift. Then set `ARIVISO_DIAGNOSTIC_ENABLED=true` for push, pull request, and merge queue diagnostics.

A hosted image or font change requires another deliberate trusted profile update. A code change to the executor or its trusted settings changes the executor digest and plan digest. Regenerate `.github/ariviso-plan.json`, then update the service configuration and both immutable pins together. Empty environment lists prevent plan generation and capture, while probe mode can measure the profiles. A plan without shards is invalid. A placeholder package hash or missing download secret also prevents capture. Replace zero workflow pins before publishing the caller.

## Measured hosted profiles

The committed allowlists come from [the successful profile-only run](https://github.com/ariakit/ariakit/actions/runs/35708007382) on September 22, 2026. Its immutable reusable workflow was `dad3fca26eb57cf5a9276a885fc14d4b82a43320`, with executor source `ecfd678493c00815ec39681ce1a49da1d36abb6a`. All three artifact archive hashes and every profile digest were verified before generating the plan. Each browser contributes 96 profiles, including both forced-color states.

| Browser  | Version       | Runner image              | Architecture | Font files |
| -------- | ------------- | ------------------------- | ------------ | ---------- |
| Chromium | 153.0.8010.12 | ubuntu24 / 20260907.300.1 | x64          | 122        |
| Firefox  | 155.0         | ubuntu24 / 20260907.300.1 | x64          | 122        |
| WebKit   | 26.6          | macos15 / 20260907.0337.1 | arm64        | 414        |

The probe took no screenshots and requested no service identity token. The generated plan still requires trusted-main review and service registration before capture. Full capture, comparison, drift measurement, and required-check cutover remain separate launch checks.

## Completeness and authority

The reusable workflow copies the immutable executor into `RUNNER_TEMP`, outside the candidate checkout. Its own package manifest, lockfile, and TypeScript configuration control dependency and module resolution. The runner and CLI use explicit executable paths. Candidate workspace settings and TypeScript aliases cannot replace those imports. The fixed TypeScript configuration also routes candidate test imports of Playwright and the capture adapter to this runtime.

The workflow uses fixed browser jobs named `capture / chromium`, `capture / firefox`, and `capture / webkit`. It selects one fixed project per job with explicit file globs and `@visual` selection in the immutable configuration. The only test invocation, from the executor directory, is:

```sh
node node_modules/playwright/cli.js test --config playwright.config.mjs
```

The reporter checks the complete discovered test inventory and final successful attempts. It writes a manifest only when every collected test succeeds and every started capture completes. No extra command-line filters or project overrides are accepted. The service verifies the signed current job and exact pinned reusable workflow before it accepts discovery.

After upload and finalization, the job uploads only `receipt.json` with the reporter's exact `ariviso-discovery-<attempt>-<job>-<shard>-<manifest digest>` artifact name. Artifact overwrite is disabled and an absent file fails the job. The service reads independent GitHub artifact metadata after job success to bind the submitted manifest. The receipt ZIP is not an authority source.

Failed-attempt screenshots, traces, manifests, and image files stay on the disposable runner. The workflow does not upload them as public repository artifacts. A failed job reports a failing check; any later diagnostic retention must use the authenticated private service.

The workflow grants no visual approval and changes no required check. Capture-plan additions and removals remain reviewable changes. Required-check cutover and removal of tracked screenshot originals remain separate launch actions after the readiness evidence passes.

Run `node --test .github/ariviso.test.mjs` from the repository root to check WebKit forced-color profiles, compiler-alias isolation, and distinct review labels. The profile test uses the installed Playwright WebKit browser. These checks use temporary files and do not take screenshots.
