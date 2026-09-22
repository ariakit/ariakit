import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { createRequire, registerHooks } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

const repositoryRoot = path.resolve(import.meta.dirname, "..");
const executorSource = path.join(import.meta.dirname, "ariviso");
const require = createRequire(path.join(repositoryRoot, "app/package.json"));
const playwrightCli = require.resolve("@playwright/test/cli");
const playwrightPackage = path.dirname(
  require.resolve("@playwright/test/package.json"),
);

test("measures WebKit forced colors used by the complete visual suite", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "ariviso-profile-test-"));
  try {
    const executor = path.join(directory, "executor");
    await cp(executorSource, executor, {
      recursive: true,
      filter: (source) => path.basename(source) !== "node_modules",
    });
    await mkdir(path.join(executor, "node_modules/@playwright"), {
      recursive: true,
    });
    await symlink(
      playwrightPackage,
      path.join(executor, "node_modules/@playwright/test"),
      "dir",
    );
    const app = path.join(directory, "app");
    await mkdir(path.join(app, "node_modules/@fontsource-variable"), {
      recursive: true,
    });
    await writeFile(path.join(app, "package.json"), "{}");
    await symlink(
      path.dirname(require.resolve("@fontsource-variable/inter/package.json")),
      path.join(app, "node_modules/@fontsource-variable/inter"),
      "dir",
    );
    const result = spawnSync(
      process.execPath,
      [path.join(executor, "environment.mjs")],
      {
        encoding: "utf8",
        timeout: 30_000,
        env: {
          ...process.env,
          GITHUB_WORKSPACE: directory,
          ARIVISO_BROWSER: "webkit",
        },
      },
    );
    assert.equal(result.status, 0, result.stderr);
    const measured = JSON.parse(
      await readFile(
        path.join(app, ".ariviso-results/environment-webkit.json"),
        "utf8",
      ),
    );
    for (const colorScheme of ["light", "dark"]) {
      for (const forcedColors of ["none", "active"]) {
        assert.ok(
          measured.environmentProfiles.some(
            ({ profile }) =>
              profile.colorScheme === colorScheme &&
              profile.forcedColors === forcedColors,
          ),
          `Missing WebKit ${colorScheme}/${forcedColors} profile`,
        );
      }
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("keeps candidate TypeScript aliases out of executor imports", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "ariviso-alias-test-"));
  try {
    const app = path.join(directory, "app");
    // Use the former candidate-local placement to exercise the immutable
    // compiler configuration even without the workflow's separate directory.
    const executor = path.join(app, ".ariviso");
    await cp(executorSource, executor, {
      recursive: true,
      filter: (source) => path.basename(source) !== "node_modules",
    });
    await writeFile(
      path.join(executor, "environments.json"),
      JSON.stringify({ chromium: [], firefox: [], webkit: [] }),
    );
    await mkdir(path.join(executor, "node_modules/@playwright"), {
      recursive: true,
    });
    await symlink(
      playwrightPackage,
      path.join(executor, "node_modules/@playwright/test"),
      "dir",
    );
    await writeFile(path.join(app, "package.json"), '{"type":"module"}');
    await writeFile(
      path.join(app, "tsconfig.json"),
      JSON.stringify({
        compilerOptions: {
          allowJs: true,
          baseUrl: ".",
          paths: { "@playwright/test": ["./candidate-shim.mjs"] },
        },
      }),
    );
    await writeFile(
      path.join(app, "candidate-shim.mjs"),
      'export const defineConfig = () => {}; export const devices = {}; throw new Error("CANDIDATE_CONFIG_OVERRIDE_REACHED");',
    );
    const run = () =>
      spawnSync(
        process.execPath,
        [
          playwrightCli,
          "test",
          "--config",
          path.join(executor, "playwright.config.mjs"),
        ],
        {
          cwd: app,
          encoding: "utf8",
          timeout: 15_000,
          env: {
            ...process.env,
            CI: "true",
            GITHUB_ACTIONS: "true",
            GITHUB_WORKSPACE: directory,
            ARIVISO_BROWSER: "chromium",
          },
        },
      );
    const protectedRun = run();
    assert.equal(protectedRun.status, 1);
    assert.match(
      protectedRun.stderr,
      /Register measured chromium environment profiles/,
    );
    assert.doesNotMatch(
      protectedRun.stderr,
      /CANDIDATE_CONFIG_OVERRIDE_REACHED/,
    );

    // Confirm that this fixture detects the reported pre-validation redirect.
    await rm(path.join(executor, "tsconfig.json"));
    const unprotectedRun = run();
    assert.equal(unprotectedRun.status, 1);
    assert.match(unprotectedRun.stderr, /CANDIDATE_CONFIG_OVERRIDE_REACHED/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("keeps distinct review labels for sections from one visual test", async () => {
  const hooks = registerHooks({
    resolve(specifier, context, nextResolve) {
      if (specifier === "@ariviso/playwright") {
        return {
          url: "data:text/javascript,export async function visual(page, options) { page.captureRecord(options); }",
          shortCircuit: true,
        };
      }
      return nextResolve(specifier, context);
    },
  });
  try {
    const { captureAriviso } = await import("../app/src/test-utils/ariviso.ts");
    const captures = [];
    const page = {
      context: () => ({
        browser: () => ({ browserType: () => ({ name: () => "chromium" }) }),
      }),
      evaluate: async () => ({
        colorScheme: "light",
        contrast: "no-preference",
        forcedColors: "none",
      }),
      captureRecord: (capture) => captures.push(capture),
    };
    for (const capture of ["default", "brand"]) {
      await captureAriviso(page, {
        options: { item: "ui/badge/page", capture, framework: "react" },
        screenshot: {},
        viewport: "desktop",
        style: "default",
        testInfo: { title: "page @visual", annotations: [] },
      });
    }
    // The service uses item keys when no display name overrides them.
    assert.deepEqual(
      captures.map((capture) => capture.name ?? capture.item),
      ["ui/badge/page/default", "ui/badge/page/brand"],
    );
  } finally {
    hooks.deregister();
  }
});
