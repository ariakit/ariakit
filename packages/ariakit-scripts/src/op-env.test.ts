import { execFileSync, spawnSync } from "node:child_process";
import {
  chmodSync,
  mkdtempSync,
  mkdirSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, join } from "node:path";
import { afterEach, expect, test } from "vitest";

const cliPath = join(import.meta.dirname, "index.ts");
const fixturePaths: string[] = [];

interface EnvFixtureOptions {
  configured?: boolean;
}

function createEnvFixture({ configured = true }: EnvFixtureOptions = {}) {
  const rootPath = mkdtempSync(join(tmpdir(), "ariakit-env-"));
  const binPath = join(rootPath, "bin");
  fixturePaths.push(rootPath);

  mkdirSync(binPath);
  writeFileSync(
    join(rootPath, "package.json"),
    `${JSON.stringify(
      {
        private: true,
        scripts: {
          "op-env": "ariakit op-env",
          "dev-app": "ariakit dev",
          playwright: "playwright test",
          "preview-app": "preview app",
          "preview-app-lite": "preview app lite",
        },
      },
      null,
      2,
    )}\n`,
  );

  execFileSync("git", ["init", "--quiet"], { cwd: rootPath });
  if (configured) {
    execFileSync(
      "git",
      ["config", "--local", "ariakit.op-env", "test-environment-id"],
      { cwd: rootPath },
    );
  }

  const opPath = join(binPath, "op");
  writeFileSync(
    opPath,
    `#!/usr/bin/env node
console.log(JSON.stringify({
  args: process.argv.slice(2),
  cwd: process.cwd(),
  includeProcessEnv: process.env.CLOUDFLARE_INCLUDE_PROCESS_ENV ?? null,
}));
`,
  );
  chmodSync(opPath, 0o755);

  const env = { ...process.env };
  env.PATH = [binPath, process.env.PATH].filter(Boolean).join(delimiter);
  delete env.CLOUDFLARE_INCLUDE_PROCESS_ENV;

  return { rootPath, env };
}

function runOpEnv(rootPath: string, env: NodeJS.ProcessEnv, ...args: string[]) {
  return spawnSync(process.execPath, [cliPath, "op-env", ...args], {
    cwd: rootPath,
    encoding: "utf-8",
    env,
  });
}

afterEach(() => {
  for (const fixturePath of fixturePaths.splice(0)) {
    rmSync(fixturePath, { recursive: true, force: true });
  }
});

test("runs root scripts from the repository root", () => {
  const { rootPath, env } = createEnvFixture();
  const nestedPath = join(rootPath, "packages", "example");
  mkdirSync(nestedPath, { recursive: true });

  const result = runOpEnv(nestedPath, env, "dev-app", "--port", "4321");

  expect(result.status).toBe(0);
  const output = JSON.parse(result.stdout);
  expect(output).toEqual({
    args: [
      "run",
      "--environment",
      "test-environment-id",
      "--",
      "pnpm",
      "run",
      "dev-app",
      "--port",
      "4321",
    ],
    cwd: realpathSync(rootPath),
    includeProcessEnv: null,
  });
});

test.each(["preview-app", "preview-app-lite"])(
  "includes process env for the %s script",
  (script) => {
    const { rootPath, env } = createEnvFixture();

    const result = runOpEnv(rootPath, env, script);

    expect(result.status).toBe(0);
    expect(JSON.parse(result.stdout).includeProcessEnv).toBe("true");
  },
);

test("runs colliding commands after the argument separator", () => {
  const { rootPath, env } = createEnvFixture();

  const result = runOpEnv(rootPath, env, "--", "playwright", "--help");

  expect(result.status).toBe(0);
  expect(JSON.parse(result.stdout).args).toEqual([
    "run",
    "--environment",
    "test-environment-id",
    "--",
    "playwright",
    "--help",
  ]);
});

test("explains how to configure the 1Password Environment", () => {
  const { rootPath, env } = createEnvFixture({ configured: false });

  const result = runOpEnv(rootPath, env, "dev-app");

  expect(result.status).toBe(1);
  expect(result.stderr).toContain(
    "No 1Password Environment is configured for this repository.",
  );
  expect(result.stderr).toContain(
    "git config --local ariakit.op-env <environment-id>",
  );
  expect(result.stderr).toContain("pnpm op-env <script>");
});
