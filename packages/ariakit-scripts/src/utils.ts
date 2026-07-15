import { spawn, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join, sep } from "node:path";

export interface RunCommandOptions {
  cwd: string;
  env?: NodeJS.ProcessEnv;
}

export interface PackageJson {
  name: string;
  scripts?: Record<string, string>;
  exports?: Record<string, unknown>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  [key: string]: unknown;
}

export function normalizePath(path: string) {
  return path.split(sep).join("/");
}

export function getCommandOutput(command: string, args: string[], cwd: string) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf-8",
  });

  if (result.error) throw result.error;
  if (result.status !== 0) {
    const commandText = [command, ...args].join(" ");
    throw new Error(
      `${commandText} failed with ${result.signal ?? result.status}`,
    );
  }

  const output = result.stdout.trim();
  if (!output) {
    const commandText = [command, ...args].join(" ");
    throw new Error(`${commandText} returned empty output`);
  }

  return output;
}

export async function runCommand(
  command: string,
  args: string[],
  options: RunCommandOptions,
) {
  return await new Promise<number>((resolvePromise, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      env: options.env,
      stdio: "inherit",
    });

    const onSigint = () => child.kill("SIGINT");
    const onSigterm = () => child.kill("SIGTERM");
    const cleanup = () => {
      process.off("SIGINT", onSigint);
      process.off("SIGTERM", onSigterm);
    };

    child.on("error", (error) => {
      cleanup();
      reject(error);
    });
    child.on("exit", (code, signal) => {
      cleanup();
      if (code != null) {
        resolvePromise(code);
        return;
      }
      if (signal === "SIGINT") {
        resolvePromise(130);
        return;
      }
      if (signal === "SIGTERM") {
        resolvePromise(143);
        return;
      }
      resolvePromise(1);
    });

    process.once("SIGINT", onSigint);
    process.once("SIGTERM", onSigterm);
  });
}

/**
 * Reads the package.json file inside the provided package directory.
 */
export function readPackageJson(rootPath: string): PackageJson {
  const packageJsonPath = join(rootPath, "package.json");
  return JSON.parse(readFileSync(packageJsonPath, "utf-8"));
}

/**
 * Reads a package.json file from a fully resolved file path.
 */
export async function readPackageJsonFile(path: string): Promise<PackageJson> {
  const contents = await readFile(path, "utf-8");
  return JSON.parse(contents);
}
