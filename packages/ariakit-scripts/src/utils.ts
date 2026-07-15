import { fork, spawn, spawnSync } from "node:child_process";
import type { ChildProcess } from "node:child_process";
import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join, sep } from "node:path";

export interface RunCommandOptions {
  cwd: string;
  env?: NodeJS.ProcessEnv;
  signalMode?: "forward" | "supervised";
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
  const signalMode = options.signalMode ?? "forward";
  if (signalMode === "supervised" && process.platform === "win32") {
    throw new Error("Supervised commands are not supported on Windows");
  }

  return await new Promise<number>((resolvePromise, reject) => {
    let child: ChildProcess | undefined;
    let stopRequest = 0;

    const forwardSignal = (signal: NodeJS.Signals, onSent?: () => void) => {
      const currentChild = child;
      if (!currentChild) return;
      if (signalMode === "supervised") {
        if (!currentChild.connected) return;
        currentChild.send(signal, (error) => {
          if (error) return;
          onSent?.();
        });
        return;
      }
      if (currentChild.kill(signal)) {
        onSent?.();
      }
    };
    const onSigcont = () => {
      stopRequest += 1;
      forwardSignal("SIGCONT");
    };
    const onSighup = () => forwardSignal("SIGHUP");
    const onSigint = () => forwardSignal("SIGINT");
    const onSigquit = () => forwardSignal("SIGQUIT");
    const onSigterm = () => forwardSignal("SIGTERM");
    const onSigtstp = () => {
      const request = ++stopRequest;
      forwardSignal("SIGTSTP", () => {
        if (request !== stopRequest) return;
        process.kill(process.pid, "SIGSTOP");
      });
    };
    const cleanup = () => {
      process.off("SIGCONT", onSigcont);
      process.off("SIGHUP", onSighup);
      process.off("SIGINT", onSigint);
      process.off("SIGQUIT", onSigquit);
      process.off("SIGTERM", onSigterm);
      process.off("SIGTSTP", onSigtstp);
    };

    // Install these handlers before forking so the process catches startup
    // signals. IPC buffers their messages until the supervisor can read them.
    if (signalMode === "supervised") {
      process.on("SIGHUP", onSighup);
      process.on("SIGINT", onSigint);
      process.on("SIGQUIT", onSigquit);
      process.on("SIGTERM", onSigterm);
      process.on("SIGCONT", onSigcont);
      process.on("SIGTSTP", onSigtstp);
    }

    try {
      child =
        signalMode === "supervised"
          ? fork(
              new URL("./command-supervisor.ts", import.meta.url),
              [command, ...args],
              {
                cwd: options.cwd,
                detached: true,
                env: options.env,
                stdio: ["inherit", "inherit", "inherit", "ipc"],
              },
            )
          : spawn(command, args, {
              cwd: options.cwd,
              env: options.env,
              stdio: "inherit",
            });
    } catch (error) {
      cleanup();
      reject(error);
      return;
    }

    const spawnedChild = child;
    if (!spawnedChild) {
      cleanup();
      reject(new Error("Failed to start command"));
      return;
    }
    spawnedChild.on("error", (error) => {
      cleanup();
      reject(error);
    });
    spawnedChild.on("exit", (code, signal) => {
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

    if (signalMode !== "supervised") {
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
