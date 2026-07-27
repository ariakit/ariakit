import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";
import {
  assertCIGate,
  ciWorkflowNames,
  createCIPlan,
  parseLockfileImporterChanges,
  parseChangedFiles,
  serializeCIGatePlan,
} from "./ci.ts";
import type { CIGateResult, CIWorkflowName, PackageJSONChange } from "./ci.ts";

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

function getPackageJSONChange(
  file: string,
  base: Record<string, unknown>,
  head: Record<string, unknown>,
): PackageJSONChange {
  return { file, base, head };
}

function expectSelectedWorkflows(
  plan: ReturnType<typeof createCIPlan>,
  workflows: readonly CIWorkflowName[],
) {
  expect(
    ciWorkflowNames.filter((workflow) => plan.workflows[workflow]),
  ).toEqual(workflows);
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

test("fails closed without dependency details and for CI infrastructure", () => {
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

test("selects CI from reviewed root dependency updates", () => {
  const plan = createCIPlan(["package.json", "pnpm-lock.yaml"], {
    changedLockfileImporters: ["."],
    packageJSONChanges: [
      getPackageJSONChange(
        "package.json",
        {
          devDependencies: {
            "lint-staged": "17.1.1",
            oxfmt: "0.59.0",
            vitest: "4.1.9",
          },
        },
        {
          devDependencies: {
            "lint-staged": "17.2.0",
            oxfmt: "0.60.0",
            vitest: "4.1.10",
          },
        },
      ),
    ],
  });

  expectSelectedWorkflows(plan, ["main", "perf", "docs"]);
});

test("runs Docs for reviewed root type dependencies", () => {
  const plan = createCIPlan(["package.json", "pnpm-lock.yaml"], {
    changedLockfileImporters: ["."],
    packageJSONChanges: [
      getPackageJSONChange(
        "package.json",
        { devDependencies: { "@types/react": "19.2.16" } },
        { devDependencies: { "@types/react": "19.2.17" } },
      ),
    ],
  });

  expectSelectedWorkflows(plan, ["main", "docs"]);
});

test("keeps unreviewed root dependency updates on full CI", () => {
  const plan = createCIPlan(["package.json", "pnpm-lock.yaml"], {
    packageJSONChanges: [
      getPackageJSONChange(
        "package.json",
        { devDependencies: { vite: "8.1.4" } },
        { devDependencies: { vite: "8.1.5" } },
      ),
    ],
  });

  expect(Object.values(plan.workflows).every(Boolean)).toBe(true);
});

test.each([
  {
    file: "app/package.json",
    workflows: ["main", "app", "perf", "og_images"],
  },
  { file: "examples/package.json", workflows: ["main"] },
  { file: "guide/package.json", workflows: ["main", "plus"] },
  {
    file: "nextjs/package.json",
    workflows: ["main", "app", "perf"],
  },
  {
    file: "templates/react/package.json",
    workflows: ["main", "release_preview"],
  },
  { file: "website/package.json", workflows: ["main", "plus"] },
] satisfies Array<{ file: string; workflows: CIWorkflowName[] }>)(
  "selects CI from $file dependency updates",
  ({ file, workflows }) => {
    const importer = file.replace(/\/package\.json$/, "");
    const plan = createCIPlan([file, "pnpm-lock.yaml"], {
      changedLockfileImporters: [importer],
      packageJSONChanges: [
        getPackageJSONChange(
          file,
          { dependencies: { dependency: "1.0.0" } },
          { dependencies: { dependency: "1.0.1" } },
        ),
      ],
    });

    expectSelectedWorkflows(plan, workflows);
  },
);

test("keeps unknown workspace dependency updates on full CI", () => {
  const file = "foo/package.json";
  const plan = createCIPlan([file, "pnpm-lock.yaml"], {
    changedLockfileImporters: ["foo"],
    packageJSONChanges: [
      getPackageJSONChange(
        file,
        { dependencies: { dependency: "1.0.0" } },
        { dependencies: { dependency: "1.0.1" } },
      ),
    ],
  });

  expect(Object.values(plan.workflows).every(Boolean)).toBe(true);
});

test("selects consumer CI for public package runtime dependencies", () => {
  const plan = createCIPlan(
    ["packages/ariakit-react/package.json", "pnpm-lock.yaml"],
    {
      changedLockfileImporters: ["packages/ariakit-react"],
      packageJSONChanges: [
        getPackageJSONChange(
          "packages/ariakit-react/package.json",
          { peerDependencies: { react: ">=18" } },
          { peerDependencies: { react: ">=19" } },
        ),
      ],
    },
  );

  expectSelectedWorkflows(plan, [
    "main",
    "app",
    "perf",
    "plus",
    "release_preview",
    "docs",
    "og_images",
  ]);
});

test("keeps public peer dependency metadata changes on full CI", () => {
  const plan = createCIPlan(
    ["packages/ariakit-test/package.json", "pnpm-lock.yaml"],
    {
      packageJSONChanges: [
        getPackageJSONChange(
          "packages/ariakit-test/package.json",
          {
            peerDependencies: { react: ">=18" },
            peerDependenciesMeta: { react: { optional: true } },
          },
          {
            peerDependencies: { react: ">=18" },
            peerDependenciesMeta: { react: { optional: false } },
          },
        ),
      ],
    },
  );

  expect(Object.values(plan.workflows).every(Boolean)).toBe(true);
});

test("keeps metadata for undeclared peers on full CI", () => {
  const file = "packages/ariakit-test/package.json";
  const plan = createCIPlan([file, "pnpm-lock.yaml"], {
    packageJSONChanges: [
      getPackageJSONChange(
        file,
        { peerDependencies: {} },
        {
          peerDependencies: {},
          peerDependenciesMeta: { ghost: { optional: true } },
        },
      ),
    ],
  });

  expect(Object.values(plan.workflows).every(Boolean)).toBe(true);
});

test("keeps other public package development dependencies on Main CI", () => {
  const plan = createCIPlan(
    ["packages/ariakit-react-utils/package.json", "pnpm-lock.yaml"],
    {
      changedLockfileImporters: ["packages/ariakit-react-utils"],
      packageJSONChanges: [
        getPackageJSONChange(
          "packages/ariakit-react-utils/package.json",
          { devDependencies: { react: "19.2.7" } },
          { devDependencies: { react: "19.2.8" } },
        ),
      ],
    },
  );

  expectSelectedWorkflows(plan, ["main"]);
});

test("runs Docs for public package type dependencies", () => {
  const file = "packages/ariakit-react-store/package.json";
  const plan = createCIPlan([file, "pnpm-lock.yaml"], {
    changedLockfileImporters: ["packages/ariakit-react-store"],
    packageJSONChanges: [
      getPackageJSONChange(
        file,
        { devDependencies: { "@types/use-sync-external-store": "1.4.0" } },
        { devDependencies: { "@types/use-sync-external-store": "1.5.0" } },
      ),
    ],
  });

  expectSelectedWorkflows(plan, ["main", "docs"]);
});

test("keeps private package dependency updates on full CI", () => {
  const plan = createCIPlan(
    ["packages/ariakit-scripts/package.json", "pnpm-lock.yaml"],
    {
      packageJSONChanges: [
        getPackageJSONChange(
          "packages/ariakit-scripts/package.json",
          {
            private: true,
            dependencies: { "rolldown-plugin-dts": "0.27.12" },
          },
          {
            private: true,
            dependencies: { "rolldown-plugin-dts": "0.27.13" },
          },
        ),
      ],
    },
  );

  expect(Object.values(plan.workflows).every(Boolean)).toBe(true);
});

test("unions dependency CI with ordinary file heuristics", () => {
  const plan = createCIPlan(
    ["app/package.json", "pnpm-lock.yaml", "website/src/pages/index.tsx"],
    {
      changedLockfileImporters: ["app"],
      packageJSONChanges: [
        getPackageJSONChange(
          "app/package.json",
          { dependencies: { "@clerk/astro": "4.0.0" } },
          { dependencies: { "@clerk/astro": "4.0.1" } },
        ),
      ],
    },
  );

  expectSelectedWorkflows(plan, ["main", "app", "perf", "plus", "og_images"]);
});

test("fails closed when the lockfile changes an unrelated importer", () => {
  const options = {
    packageJSONChanges: [
      getPackageJSONChange(
        "app/package.json",
        { dependencies: { "@clerk/astro": "4.0.0" } },
        { dependencies: { "@clerk/astro": "4.0.1" } },
      ),
    ],
    changedLockfileImporters: ["app", "website"],
  };
  const plan = createCIPlan(["app/package.json", "pnpm-lock.yaml"], options);

  expect(Object.values(plan.workflows).every(Boolean)).toBe(true);
});

test("falls back to full CI for package metadata changes", () => {
  const plan = createCIPlan(["app/package.json", "pnpm-lock.yaml"], {
    packageJSONChanges: [
      getPackageJSONChange(
        "app/package.json",
        { scripts: { build: "astro build" } },
        { scripts: { build: "astro check && astro build" } },
      ),
    ],
  });

  expect(Object.values(plan.workflows).every(Boolean)).toBe(true);
});

test("does not scope lockfile changes without a dependency update", () => {
  const plan = createCIPlan(["app/package.json", "pnpm-lock.yaml"], {
    packageJSONChanges: [
      getPackageJSONChange("app/package.json", {}, { devDependencies: {} }),
    ],
  });

  expect(Object.values(plan.workflows).every(Boolean)).toBe(true);
});

test("does not scope lockfile changes with empty peer metadata", () => {
  const file = "packages/ariakit-test/package.json";
  const plan = createCIPlan([file, "pnpm-lock.yaml"], {
    packageJSONChanges: [
      getPackageJSONChange(file, {}, { peerDependenciesMeta: {} }),
    ],
  });

  expect(Object.values(plan.workflows).every(Boolean)).toBe(true);
});

test("does not use package versions to scope lockfile changes", () => {
  const plan = createCIPlan(
    ["packages/ariakit-react/package.json", "pnpm-lock.yaml"],
    {
      packageJSONChanges: [
        getPackageJSONChange(
          "packages/ariakit-react/package.json",
          { version: "0.4.35" },
          { version: "0.4.36" },
        ),
      ],
    },
  );

  expect(Object.values(plan.workflows).every(Boolean)).toBe(true);
});

test("requires every changed manifest to scope the lockfile", () => {
  const plan = createCIPlan(
    [
      "app/package.json",
      "packages/ariakit-react/package.json",
      "pnpm-lock.yaml",
    ],
    {
      packageJSONChanges: [
        getPackageJSONChange(
          "app/package.json",
          { dependencies: { "@clerk/astro": "4.0.0" } },
          { dependencies: { "@clerk/astro": "4.0.1" } },
        ),
        getPackageJSONChange(
          "packages/ariakit-react/package.json",
          { version: "0.4.35" },
          { version: "0.4.36" },
        ),
      ],
    },
  );

  expect(Object.values(plan.workflows).every(Boolean)).toBe(true);
});

test("rejects empty dependency metadata in grouped lockfile updates", () => {
  const plan = createCIPlan(
    ["app/package.json", "examples/package.json", "pnpm-lock.yaml"],
    {
      packageJSONChanges: [
        getPackageJSONChange(
          "app/package.json",
          { dependencies: { "@clerk/astro": "4.0.0" } },
          { dependencies: { "@clerk/astro": "4.0.1" } },
        ),
        getPackageJSONChange(
          "examples/package.json",
          {},
          { devDependencies: {} },
        ),
      ],
    },
  );

  expect(Object.values(plan.workflows).every(Boolean)).toBe(true);
});

test("avoids full CI for generated publish metadata", () => {
  const plan = createCIPlan(
    [
      ".changeset/example.md",
      "packages/ariakit-react/CHANGELOG.md",
      "packages/ariakit-react/package.json",
    ],
    {
      baseRef: "main",
      packageJSONChanges: [
        getPackageJSONChange(
          "packages/ariakit-react/package.json",
          { version: "0.4.35" },
          { version: "0.4.36" },
        ),
      ],
    },
  );

  expectSelectedWorkflows(plan, ["main", "release_preview"]);
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

test("keeps labels out of CI plans", () => {
  expect(createCIPlan(["readme.md"])).not.toHaveProperty("labels");
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

test("compares exact lockfile importer blocks", () => {
  const base = `lockfileVersion: '9.0'

importers:

  app:
    dependencies:
      astro:
        specifier: 7.0.0
        version: 7.0.0

  website: {}

packages:
  astro@7.0.0: {}
`;
  const head = `lockfileVersion: '9.0'

importers:

  app:
    dependencies:
      astro:
        specifier: 7.0.1
        version: 7.0.1

  website:
    dependencies: {}

packages:
  astro@7.0.1: {}
`;

  expect(parseLockfileImporterChanges(base, head)).toEqual(["app", "website"]);
  expect(parseLockfileImporterChanges("invalid", head)).toBeUndefined();
});

test("parses the repository lockfile", () => {
  const lockfile = readFileSync(
    join(import.meta.dirname, "../../../pnpm-lock.yaml"),
    "utf-8",
  );

  expect(parseLockfileImporterChanges(lockfile, lockfile)).toEqual([]);
});

test("rejects importer membership changes", () => {
  const base = `lockfileVersion: '9.0'

importers:

  app: {}

packages: {}
`;
  const added = base.replace("  app: {}", "  app: {}\n\n  website: {}");

  expect(parseLockfileImporterChanges(base, added)).toBeUndefined();
  expect(parseLockfileImporterChanges(added, base)).toBeUndefined();
});

test("rejects malformed importer blocks", () => {
  const base = `lockfileVersion: '9.0'

importers:

  app: {}

packages: {}
`;
  const malformedInline = base.replace("  app: {}", "  app: []");
  const malformedIndentation = base.replace("  app: {}", "   app: {}");
  const malformedBlockSequence = base.replace("  app: {}", "  app:\n    []");
  const malformedBlockScalar = base.replace("  app: {}", "  app:\n    value");
  const commentsOnlyBlock = base.replace(
    "  app: {}",
    "  app:\n    # no importer data",
  );

  expect(parseLockfileImporterChanges(base, malformedInline)).toBeUndefined();
  expect(
    parseLockfileImporterChanges(base, malformedIndentation),
  ).toBeUndefined();
  expect(
    parseLockfileImporterChanges(base, malformedBlockSequence),
  ).toBeUndefined();
  expect(
    parseLockfileImporterChanges(base, malformedBlockScalar),
  ).toBeUndefined();
  expect(parseLockfileImporterChanges(base, commentsOnlyBlock)).toBeUndefined();
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
