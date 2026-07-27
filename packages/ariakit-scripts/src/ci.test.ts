import { expect, test } from "vitest";
import {
  assertCIGate,
  ciWorkflowNames,
  createCIPlan,
  parseChangedFiles,
  serializeCIGatePlan,
} from "./ci.ts";
import type { CIGateResult } from "./ci.ts";

function getResults(
  plan: ReturnType<typeof createCIPlan>,
  overrides: Record<string, CIGateResult> = {},
) {
  const results: Record<string, CIGateResult> = {
    plan: { result: "success" },
  };
  for (const workflow of ciWorkflowNames) {
    results[workflow] = {
      result: plan.workflows[workflow] ? "success" : "skipped",
    };
  }
  return { ...results, ...overrides };
}

test("keeps core and legacy browser tests on every pull request", () => {
  const plan = createCIPlan(["readme.md"]);

  expect(plan.workflows).toEqual({
    main: true,
    app: false,
    perf: false,
    plus: false,
    release_preview: false,
    docs: false,
    build_styles: false,
    og_images: false,
  });
});

test("runs every workflow for dependency and CI infrastructure changes", () => {
  for (const file of [
    "pnpm-lock.yaml",
    "app/package.json",
    "app/astro.config.mjs",
    "app/wrangler.jsonc",
    ".changeset/config.json",
    "website/build-pages/config.js",
    "packages/ariakit-components/package.json",
    "packages/ariakit-components/tsconfig.json",
    ".github/workflows/ci.yml",
    "packages/ariakit-scripts/src/ci.ts",
  ]) {
    const plan = createCIPlan([file]);
    expect(Object.values(plan.workflows).every(Boolean), file).toBe(true);
  }
});

test("runs app, performance, docs, release, and website checks for package code", () => {
  const plan = createCIPlan([
    "packages/ariakit-components/src/dialog/dialog.ts",
  ]);

  expect(plan.workflows).toMatchObject({
    main: true,
    app: true,
    perf: true,
    plus: true,
    release_preview: true,
    docs: true,
    build_styles: false,
    og_images: true,
  });
});

test("does not run performance checks for package tests", () => {
  const plan = createCIPlan([
    "packages/ariakit-components/src/dialog/dialog.test.ts",
  ]);

  expect(plan.workflows.main).toBe(true);
  expect(plan.workflows.perf).toBe(false);
});

test("runs app tests without treating them as performance inputs", () => {
  const plan = createCIPlan(["app/src/lib/og-image-key.test.ts"]);

  expect(plan.workflows.app).toBe(true);
  expect(plan.workflows.perf).toBe(false);
});

test("falls back to full CI for unknown non-documentation paths", () => {
  for (const file of [
    "tooling/new-config.json",
    "tooling/new-config.test.ts",
  ]) {
    const plan = createCIPlan([file]);
    expect(Object.values(plan.workflows).every(Boolean), file).toBe(true);
  }
});

test("runs generated asset workflows only for their inputs", () => {
  const stylesPlan = createCIPlan(["app/src/styles/ak-button.css"]);
  expect(stylesPlan.workflows.build_styles).toBe(true);
  expect(stylesPlan.workflows.og_images).toBe(true);

  const ogPlan = createCIPlan(["app/src/pages/og-image/api.ts"]);
  expect(ogPlan.workflows.og_images).toBe(true);
  expect(ogPlan.workflows.build_styles).toBe(false);
});

test("runs OG generation for package runtime imported by the renderer", () => {
  const plan = createCIPlan([
    "packages/ariakit-react-components/src/popover/popover-arrow-path.ts",
  ]);

  expect(plan.workflows.og_images).toBe(true);
});

test("skips OG generation for package tests and readmes", () => {
  for (const file of [
    "packages/ariakit-react-components/src/popover/popover.test.ts",
    "packages/ariakit-react-components/readme.md",
  ]) {
    expect(createCIPlan([file]).workflows.og_images, file).toBe(false);
  }
});

test("runs release previews for changesets only on main pull requests", () => {
  expect(
    createCIPlan([".changeset/example.md"], { baseRef: "main" }).workflows
      .release_preview,
  ).toBe(true);
  expect(
    createCIPlan([".changeset/example.md"], { baseRef: "next" }).workflows
      .release_preview,
  ).toBe(false);
});

test("supports full and workflow-specific override labels", () => {
  const perfPlan = createCIPlan(["readme.md"], { labels: ["ci:perf"] });
  expect(perfPlan.workflows.perf).toBe(true);
  expect(perfPlan.workflows.app).toBe(false);

  const fullPlan = createCIPlan(["readme.md"], { labels: ["ci:full"] });
  expect(Object.values(fullPlan.workflows).every(Boolean)).toBe(true);
});

test("uses labels to select CI for recognized dependency updates", () => {
  const plan = createCIPlan(["package.json", "pnpm-lock.yaml"], {
    labels: ["ci:deps", "ci:perf"],
  });

  expect(plan.workflows).toEqual({
    main: true,
    app: false,
    perf: true,
    plus: false,
    release_preview: false,
    docs: false,
    build_styles: false,
    og_images: false,
  });
});

test("keeps labeled dependency updates fail-closed for unknown manifests", () => {
  const plan = createCIPlan(
    ["packages/new-package/package.json", "pnpm-lock.yaml"],
    { labels: ["ci:deps"] },
  );

  expect(Object.values(plan.workflows).every(Boolean)).toBe(true);
});

test("unions labeled dependency CI with mixed pull request changes", () => {
  const plan = createCIPlan(
    ["app/package.json", "app/src/components/button.tsx", "pnpm-lock.yaml"],
    { labels: ["ci:deps"] },
  );

  expect(plan.workflows).toEqual({
    main: true,
    app: true,
    perf: true,
    plus: false,
    release_preview: false,
    docs: false,
    build_styles: false,
    og_images: true,
  });
});

test("keeps ci:full authoritative for labeled dependency updates", () => {
  const plan = createCIPlan(["package.json", "pnpm-lock.yaml"], {
    labels: ["ci:deps", "ci:full"],
  });

  expect(Object.values(plan.workflows).every(Boolean)).toBe(true);
});

test("runs Main only for Changesets-generated publish metadata", () => {
  const plan = createCIPlan(
    [
      ".changeset/example.md",
      "packages/ariakit-react/CHANGELOG.md",
      "packages/ariakit-react/package.json",
      "pnpm-lock.yaml",
    ],
    { labels: ["ci:publish"] },
  );

  expect(plan.workflows).toEqual({
    main: true,
    app: false,
    perf: false,
    plus: false,
    release_preview: false,
    docs: false,
    build_styles: false,
    og_images: false,
  });
});

test("classifies unexpected files on publish pull requests normally", () => {
  const plan = createCIPlan(
    [
      "packages/ariakit-react/CHANGELOG.md",
      "packages/ariakit-react/package.json",
      "packages/ariakit-react/src/dialog/dialog.ts",
    ],
    { labels: ["ci:publish"] },
  );

  expect(plan.workflows).toMatchObject({
    main: true,
    app: true,
    perf: true,
    plus: true,
    release_preview: true,
    docs: true,
    build_styles: false,
    og_images: true,
  });
});

test("ignores labels that match inherited object properties", () => {
  const plan = createCIPlan(["readme.md"], {
    labels: ["toString", "constructor", "__proto__"],
  });

  expect(plan.workflows.main).toBe(true);
  expect(plan.workflows.app).toBe(false);
  expect(plan.workflows.perf).toBe(false);
});

test("keeps both paths when git reports a rename", () => {
  expect(
    parseChangedFiles(
      [
        "M",
        "readme.md",
        "R100",
        "packages/old/src/index.ts",
        "packages/new/src/index.ts",
        "",
      ].join("\0"),
    ),
  ).toEqual([
    "readme.md",
    "packages/old/src/index.ts",
    "packages/new/src/index.ts",
  ]);
});

test("serializes a compact gate plan for large changes", () => {
  const files = Array.from({ length: 200 }, (_, index) => {
    return `packages/ariakit-components/src/long-component-name-${index}/long-source-file-name-${index}.ts`;
  });
  const plan = createCIPlan(files, { baseRef: "main" });
  const gatePlan = serializeCIGatePlan(plan);

  expect(new TextEncoder().encode(gatePlan).byteLength).toBeLessThan(1024);
  expect(JSON.parse(gatePlan)).toEqual({
    version: 1,
    workflows: plan.workflows,
  });
});

test("accepts successful selected workflows and skipped unselected workflows", () => {
  const plan = createCIPlan(["readme.md"]);

  expect(() => assertCIGate(plan, getResults(plan))).not.toThrow();
});

test("rejects failed selected workflows", () => {
  const plan = createCIPlan(["readme.md"]);

  expect(() =>
    assertCIGate(plan, getResults(plan, { main: { result: "failure" } })),
  ).toThrow("main: expected success, received failure");
});

test("rejects workflows that run outside the plan", () => {
  const plan = createCIPlan(["readme.md"]);

  expect(() =>
    assertCIGate(plan, getResults(plan, { perf: { result: "success" } })),
  ).toThrow("perf: expected skipped, received success");
});
