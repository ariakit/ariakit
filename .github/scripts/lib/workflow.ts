import { execFileSync, spawn, spawnSync } from "node:child_process";
import { appendFileSync, existsSync, readdirSync, rmSync } from "node:fs";
import path from "node:path";
import process from "node:process";

export interface RepoRef {
  owner: string;
  repo: string;
}

export function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getOptionalEnv(name: string): string | undefined {
  return process.env[name];
}

export function parseRepo(fullName: string): RepoRef {
  const [owner, repo] = fullName.split("/");
  if (!owner || !repo) {
    throw new Error(`Invalid repository name: ${fullName}`);
  }
  return { owner, repo };
}

export function setOutput(name: string, value: string): void {
  const outputPath = getRequiredEnv("GITHUB_OUTPUT");
  if (!value.includes("\n")) {
    appendFileSync(outputPath, `${name}=${value}\n`);
    return;
  }
  const delimiter = `EOF_${Math.random().toString(36).slice(2)}`;
  appendFileSync(outputPath, `${name}<<${delimiter}\n${value}\n${delimiter}\n`);
}

export function runCommand(
  command: string,
  args: string[],
  options: {
    cwd?: string;
    env?: NodeJS.ProcessEnv;
    stdio?: "inherit" | "pipe";
  } = {},
): string {
  return execFileSync(command, args, {
    cwd: options.cwd,
    env: options.env,
    stdio: options.stdio ?? "inherit",
    encoding: "utf8",
  });
}

export function runShellCommand(
  command: string,
  options: {
    cwd?: string;
    env?: NodeJS.ProcessEnv;
    stdio?: "inherit" | "pipe";
  } = {},
): string {
  const result = spawnSync(command, {
    cwd: options.cwd,
    env: options.env,
    shell: true,
    stdio: options.stdio ?? "inherit",
    encoding: "utf8",
  });
  if (result.status !== 0) {
    throw new Error(
      `Command failed with exit code ${result.status}: ${command}`,
    );
  }
  return result.stdout ?? "";
}

export function getRepositoryRoot(): string {
  return process.cwd();
}

export function fileExists(filePath: string): boolean {
  return existsSync(filePath);
}

export function findPaths(
  rootDir: string,
  matcher: (entryPath: string, isDirectory: boolean) => boolean,
): string[] {
  const matches: string[] = [];

  const visit = (directory: string) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const entryPath = path.join(directory, entry.name);
      const isDirectory = entry.isDirectory();
      if (matcher(entryPath, isDirectory)) {
        matches.push(entryPath);
      }
      if (!isDirectory) {
        continue;
      }
      visit(entryPath);
    }
  };

  visit(rootDir);
  return matches;
}

export function removePaths(paths: string[]): void {
  for (const targetPath of paths) {
    rmSync(targetPath, { force: true, recursive: true });
  }
}

export async function sleep(milliseconds: number): Promise<void> {
  await new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

export function spawnDetached(
  command: string,
  args: string[],
  options: {
    cwd?: string;
    env?: NodeJS.ProcessEnv;
  } = {},
): void {
  const child = spawn(command, args, {
    cwd: options.cwd,
    detached: true,
    env: options.env,
    stdio: "ignore",
  });
  child.unref();
}
