import { spawn, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join, sep } from "node:path";

export interface RunCommandOptions {
  cwd: string;
  detached?: boolean;
  env?: NodeJS.ProcessEnv;
  forwardSignals?: boolean;
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
      detached: options.detached,
      env: options.env,
      stdio: "inherit",
    });

    const forwardSignal = (signal: NodeJS.Signals) => {
      if (options.forwardSignals === false) return;
      child.kill(signal);
    };
    const forwardProcessGroupSignal = (signal: NodeJS.Signals) => {
      if (options.forwardSignals === false) return;
      const pid = child.pid;
      if (!pid) return;
      try {
        process.kill(-pid, signal);
      } catch (error) {
        if (!(error instanceof Error)) {
          throw error;
        }
        if (!("code" in error)) {
          throw error;
        }
        if (error.code !== "ESRCH") {
          throw error;
        }
      }
    };
    const onSigcont = () => forwardProcessGroupSignal("SIGCONT");
    const onSighup = () => forwardSignal("SIGHUP");
    const onSigint = () => forwardSignal("SIGINT");
    // Concurrently doesn't handle SIGQUIT, so signal its isolated group.
    const onSigquit = () => forwardProcessGroupSignal("SIGQUIT");
    const onSigterm = () => forwardSignal("SIGTERM");
    const onSigtstp = () => {
      // Detached sessions ignore the default SIGTSTP action, so use the
      // uncatchable stop signal for the isolated process group.
      forwardProcessGroupSignal("SIGSTOP");
      process.kill(process.pid, "SIGSTOP");
    };
    const cleanup = () => {
      process.off("SIGCONT", onSigcont);
      process.off("SIGHUP", onSighup);
      process.off("SIGINT", onSigint);
      process.off("SIGQUIT", onSigquit);
      process.off("SIGTERM", onSigterm);
      process.off("SIGTSTP", onSigtstp);
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
      if (signal === "SIGQUIT") {
        resolvePromise(131);
        return;
      }
      if (signal === "SIGTERM") {
        resolvePromise(143);
        return;
      }
      resolvePromise(1);
    });

    // Detached children rely on the parent for terminal and job-control
    // signals until they exit, including repeated signals and SIGHUP.
    if (options.detached) {
      process.on("SIGHUP", onSighup);
      process.on("SIGINT", onSigint);
      process.on("SIGTERM", onSigterm);
      if (options.forwardSignals !== false && process.platform !== "win32") {
        process.on("SIGCONT", onSigcont);
        process.on("SIGQUIT", onSigquit);
        process.on("SIGTSTP", onSigtstp);
      }
    } else {
      process.once("SIGINT", onSigint);
      process.once("SIGTERM", onSigterm);
    }
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
