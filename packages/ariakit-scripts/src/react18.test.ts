import { execFileSync, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { chmod, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { delimiter, dirname, join } from "node:path";
import { expect, test } from "vitest";
import { getReact18Command } from "./react18.ts";

const cliPath = join(import.meta.dirname, "index.ts");

// Synced into the temporary workspace along with the rest of the fixture, so
// its presence there identifies a workspace this file created.
const fixtureMarker = ".ariakit-react18-fixture";

interface React18Fixture {
  fixturePath: string;
  rootPath: string;
  binPath: string;
}

// Stands in for pnpm when the temporary workspace still records the workspace
// settings of an earlier run. Real pnpm recovers by purging and reinstalling
// the modules directory, but it asks first and aborts with this error when
// there is no TTY and the purge confirmation is still enabled. The tests spawn
// the command without a TTY, so the stub always takes that branch.
const stalePnpmSource = `#!/usr/bin/env node
console.error("[stub-pnpm]", process.argv.slice(2).join(" "));
if (process.argv.includes("--config.confirm-modules-purge=false")) {
  process.exit(0);
}
console.error("ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY");
console.error("Aborted removal of modules directory due to no TTY");
process.exit(1);
`;

const failingPnpmSource = `#!/usr/bin/env node
console.error("[stub-pnpm]", process.argv.slice(2).join(" "));
console.error("ERR_PNPM_FETCH_404");
process.exit(1);
`;

async function writeJsonFile(path: string, value: unknown) {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`);
}

/**
 * Copies the environment without the variables that redirect where git
 * resolves a repository.
 *
 * Both the fixture and the react18 command locate their repository through
 * git. Left in place, these variables would point them at the caller's own
 * checkout, and at the persistent workspace that `removeFixture` deletes.
 */
function getGitSafeEnv() {
  const env = { ...process.env };

  for (const key of ["GIT_DIR", "GIT_WORK_TREE", "GIT_COMMON_DIR"]) {
    delete env[key];
  }

  return env;
}

/**
 * Creates a throwaway repository the react18 command can sync, along with a
 * `pnpm` executable that shadows the real one through `PATH`.
 */
async function createFixture(pnpmSource: string): Promise<React18Fixture> {
  const fixturePath = await mkdtemp(join(tmpdir(), "ariakit-react18-"));
  const rootPath = join(fixturePath, "repo");
  const binPath = join(fixturePath, "bin");

  await mkdir(join(rootPath, "website"), { recursive: true });
  await mkdir(binPath, { recursive: true });

  await writeJsonFile(join(rootPath, "package.json"), {
    name: "root",
    private: true,
    dependencies: { react: "19.2.8", "react-dom": "19.2.8" },
  });
  await writeJsonFile(join(rootPath, "website/package.json"), {
    name: "website",
    dependencies: { react: "18.3.1", "react-dom": "18.3.1" },
    devDependencies: {
      "@types/react": "18.3.27",
      "@types/react-dom": "18.3.11",
    },
  });

  await writeFile(join(rootPath, fixtureMarker), "");

  const pnpmPath = join(binPath, "pnpm");
  await writeFile(pnpmPath, pnpmSource);
  await chmod(pnpmPath, 0o755);

  execFileSync("git", ["init", "--quiet"], {
    cwd: rootPath,
    env: getGitSafeEnv(),
  });

  return { fixturePath, rootPath, binPath };
}

function runReact18(fixture: React18Fixture, commandArgs: string[]) {
  const env = getGitSafeEnv();
  env.PATH = [fixture.binPath, env.PATH].filter(Boolean).join(delimiter);

  return spawnSync(
    process.execPath,
    [cliPath, "react18", "--", ...commandArgs],
    { cwd: fixture.rootPath, encoding: "utf-8", env },
  );
}

function findWorkspacePath(output: string) {
  return output.match(/Syncing workspace to (.+)/)?.[1]?.trim();
}

async function removeFixture(fixture: React18Fixture, output: string) {
  await rm(fixture.fixturePath, { recursive: true, force: true });

  const workspacePath = findWorkspacePath(output);
  if (!workspacePath) return;
  // Checkouts on the same machine share the parent temp directory, and each
  // keeps a workspace worth minutes of reinstalling. Only remove one this run
  // is proven to own.
  if (!existsSync(join(workspacePath, fixtureMarker))) return;

  await rm(dirname(workspacePath), { recursive: true, force: true });
}

test("runs an explicit command with arguments", () => {
  expect(getReact18Command(["pnpm", "test", "--run"])).toEqual({
    bin: "pnpm",
    args: ["test", "--run"],
  });
});

test("throws when the command is missing", () => {
  expect(() => getReact18Command([])).toThrow(
    "Missing command. Use `ariakit react18 -- <command>`.",
  );
});

test("documents the explicit command syntax", () => {
  const commandHelp = execFileSync(
    process.execPath,
    [cliPath, "help", "react18"],
    { encoding: "utf-8" },
  );
  const programHelp = execFileSync(process.execPath, [cliPath, "--help"], {
    encoding: "utf-8",
  });

  expect(commandHelp).toContain(
    "Usage: ariakit react18 -- <command> [args...]",
  );
  expect(programHelp).toContain(
    "Run `ariakit react18 -- <command>` in an isolated React 18 workspace",
  );
});

test.skipIf(process.platform === "win32")(
  "installs the dependency graph without stalling on a modules purge",
  async () => {
    const fixture = await createFixture(stalePnpmSource);
    const result = runReact18(fixture, [
      "node",
      "-e",
      "process.stdout.write('react18-command-ran')",
    ]);

    try {
      // Proves the stub ran instead of the real pnpm, which would satisfy the
      // remaining assertions on its own.
      expect(result.stderr).toContain("[stub-pnpm] install");
      expect(result.stderr).not.toContain(
        "ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY",
      );
      expect(result.stdout).toContain("react18-command-ran");
      expect(result.status).toBe(0);
    } finally {
      await removeFixture(fixture, result.stderr ?? "");
    }
  },
);

test.skipIf(process.platform === "win32")(
  "points at the temporary workspace when the install fails",
  async () => {
    const fixture = await createFixture(failingPnpmSource);
    const result = runReact18(fixture, ["node", "--version"]);

    try {
      const workspacePath = findWorkspacePath(result.stderr ?? "");
      expect(workspacePath).toBeTruthy();
      expect(result.stderr).toContain(
        `Failed to install the React 18 dependency graph in ${workspacePath}.`,
      );
      expect(result.stderr).toContain(`rm -rf "${workspacePath}"`);
      expect(result.status).not.toBe(0);
    } finally {
      await removeFixture(fixture, result.stderr ?? "");
    }
  },
);
