import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  mkdir,
  copyFile,
  readdir,
  readFile,
  readlink,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { delimiter, dirname, isAbsolute, join, relative, sep } from "node:path";
import { watch } from "chokidar";
import type { FSWatcher } from "chokidar";

interface PackageJson {
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  [key: string]: unknown;
}

interface React18Command {
  bin: string;
  args: string[];
}

interface RunCommandOptions {
  cwd: string;
  env?: NodeJS.ProcessEnv;
}

const dependencyFields = [
  "dependencies",
  "devDependencies",
  "optionalDependencies",
] as const;

const excludedSegments = new Set([
  ".astro",
  ".git",
  ".next",
  ".open-next",
  ".turbo",
  ".vercel",
  ".wrangler",
  "coverage",
  "dist",
  "node_modules",
  "playwright-report",
  "test-results",
]);

const excludedFiles = new Set([".DS_Store", ".dev.vars", "pnpm-lock.yaml"]);
const excludedFilePatterns = [".env*", "*.pem"];

const pathKey =
  Object.keys(process.env).find((key) => key.toLowerCase() === "path") ??
  "PATH";

function log(message: string) {
  console.error(`[react18] ${message}`);
}

function normalizePath(path: string) {
  return path.split(sep).join("/");
}

function isErrnoException(error: unknown): error is NodeJS.ErrnoException {
  if (!(error instanceof Error)) return false;
  return "code" in error;
}

function getCommandOutput(command: string, args: string[], cwd: string) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf-8",
  });

  if (result.error) throw result.error;
  if (result.status) {
    const commandText = [command, ...args].join(" ");
    throw new Error(`${commandText} failed with ${result.status}`);
  }

  const output = result.stdout.trim();
  if (!output) {
    const commandText = [command, ...args].join(" ");
    throw new Error(`${commandText} returned empty output`);
  }

  return output;
}

function getRepositoryRoot() {
  return getCommandOutput(
    "git",
    ["rev-parse", "--show-toplevel"],
    process.cwd(),
  );
}

function getWorkspacePath(rootPath: string) {
  const hash = createHash("sha1").update(rootPath).digest("hex").slice(0, 8);
  return join(tmpdir(), "ariakit-react18", hash, "workspace");
}

function shouldIgnoreRelativePath(path: string) {
  if (!path) return false;

  const normalizedPath = normalizePath(path);
  const segments = normalizedPath.split("/");
  const filename = segments.at(-1);

  if (filename && excludedFiles.has(filename)) return true;
  if (filename?.startsWith(".env")) return true;
  if (filename?.endsWith(".pem")) return true;
  return segments.some((segment) => excludedSegments.has(segment));
}

function shouldIgnoreWatchPath(rootPath: string, path: string) {
  const relativePath = isAbsolute(path) ? relative(rootPath, path) : path;
  const normalizedPath = normalizePath(relativePath);

  if (normalizedPath === "pnpm-lock.yaml") return true;
  if (normalizedPath.endsWith("/package.json")) return true;
  if (normalizedPath === "package.json") return true;

  return shouldIgnoreRelativePath(normalizedPath);
}

async function runCommand(
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

async function runChecked(
  command: string,
  args: string[],
  options: RunCommandOptions,
) {
  const exitCode = await runCommand(command, args, options);
  if (!exitCode) return;

  const commandText = [command, ...args].join(" ");
  throw new Error(`${commandText} failed with ${exitCode}`);
}

function getRsyncArgs(rootPath: string, workspacePath: string) {
  const excludeArgs = [
    ...excludedSegments,
    ...excludedFiles,
    ...excludedFilePatterns,
  ].flatMap((pattern) => ["--exclude", pattern]);

  return [
    "-a",
    "--delete",
    ...excludeArgs,
    `${rootPath}/`,
    `${workspacePath}/`,
  ];
}

async function copyDirectory(
  rootPath: string,
  sourcePath: string,
  workspacePath: string,
) {
  const relativePath = normalizePath(relative(rootPath, sourcePath));
  if (shouldIgnoreRelativePath(relativePath)) return;

  const targetPath = join(workspacePath, relativePath);
  await mkdir(targetPath, { recursive: true });

  const entries = await readdir(sourcePath, { withFileTypes: true });
  for (const entry of entries) {
    const sourceEntryPath = join(sourcePath, entry.name);
    const entryRelativePath = normalizePath(
      relative(rootPath, sourceEntryPath),
    );

    if (shouldIgnoreRelativePath(entryRelativePath)) continue;

    const targetEntryPath = join(workspacePath, entryRelativePath);
    if (entry.isDirectory()) {
      await copyDirectory(rootPath, sourceEntryPath, workspacePath);
      continue;
    }
    if (entry.isSymbolicLink()) {
      await mkdir(dirname(targetEntryPath), { recursive: true });
      await symlink(await readlink(sourceEntryPath), targetEntryPath);
      continue;
    }
    if (!entry.isFile()) continue;

    await mkdir(dirname(targetEntryPath), { recursive: true });
    await copyFile(sourceEntryPath, targetEntryPath);
  }
}

async function syncWorkspaceWithNode(rootPath: string, workspacePath: string) {
  await rm(workspacePath, { recursive: true, force: true });
  await copyDirectory(rootPath, rootPath, workspacePath);
}

async function syncWorkspace(rootPath: string, workspacePath: string) {
  await mkdir(dirname(workspacePath), { recursive: true });

  try {
    await runChecked("rsync", getRsyncArgs(rootPath, workspacePath), {
      cwd: rootPath,
    });
  } catch (error) {
    if (!isErrnoException(error)) throw error;
    if (error.code !== "ENOENT") throw error;

    log("rsync not found; falling back to a fresh Node.js copy");
    await syncWorkspaceWithNode(rootPath, workspacePath);
  }
}

async function getPackageJsonPaths(rootPath: string, directoryPath = rootPath) {
  const paths: string[] = [];
  const entries = await readdir(directoryPath, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = join(directoryPath, entry.name);
    const relativePath = normalizePath(relative(rootPath, entryPath));

    if (shouldIgnoreRelativePath(relativePath)) continue;

    if (entry.isDirectory()) {
      paths.push(...(await getPackageJsonPaths(rootPath, entryPath)));
      continue;
    }
    if (entry.name !== "package.json") continue;

    paths.push(entryPath);
  }

  return paths.sort((a, b) => a.localeCompare(b));
}

function getDependencyVersion(packageJson: PackageJson, name: string) {
  for (const field of dependencyFields) {
    const version = packageJson[field]?.[name];
    if (version) return version;
  }

  throw new Error(`${name} must be declared in website/package.json`);
}

async function readPackageJson(path: string) {
  const contents = await readFile(path, "utf-8");
  return JSON.parse(contents) as PackageJson;
}

async function getReact18DependencyVersions(rootPath: string) {
  const packageJson = await readPackageJson(
    join(rootPath, "website/package.json"),
  );

  return {
    "@types/react": getDependencyVersion(packageJson, "@types/react"),
    "@types/react-dom": getDependencyVersion(packageJson, "@types/react-dom"),
    react: getDependencyVersion(packageJson, "react"),
    "react-dom": getDependencyVersion(packageJson, "react-dom"),
  };
}

function updateReactDependencies(
  packageJson: PackageJson,
  versions: Record<string, string>,
) {
  let updated = false;

  for (const field of dependencyFields) {
    const dependencies = packageJson[field];
    if (!dependencies) continue;

    for (const [name, version] of Object.entries(versions)) {
      if (!(name in dependencies)) continue;
      if (dependencies[name] === version) continue;

      dependencies[name] = version;
      updated = true;
    }
  }

  return updated;
}

async function rewritePackageJson(
  path: string,
  versions: Record<string, string>,
) {
  const packageJson = await readPackageJson(path);

  if (!updateReactDependencies(packageJson, versions)) return false;

  await writeFile(path, `${JSON.stringify(packageJson, null, 2)}\n`);
  return true;
}

async function rewriteReactDependencies(rootPath: string) {
  const packageJsonPaths = await getPackageJsonPaths(rootPath);
  const versions = await getReact18DependencyVersions(rootPath);
  let updatedCount = 0;

  for (const packageJsonPath of packageJsonPaths) {
    if (await rewritePackageJson(packageJsonPath, versions)) {
      updatedCount += 1;
    }
  }

  return updatedCount;
}

async function readRootPackageJson(rootPath: string) {
  return await readPackageJson(join(rootPath, "package.json"));
}

function stripLeadingSeparator(args: string[]) {
  const [firstArg, ...restArgs] = args;
  return firstArg === "--" ? restArgs : args;
}

function isHelpCommand(args: string[]) {
  const [command] = stripLeadingSeparator(args);
  return !command || command === "--help" || command === "-h";
}

function printHelp() {
  console.error(
    [
      "Usage: ariakit react18 <script> [args...]",
      "       ariakit react18 -- <command> [args...]",
      "",
      "Run a root script or arbitrary command in an isolated React 18 workspace.",
    ].join("\n"),
  );
}

async function getReact18Command(
  rootPath: string,
  args: string[],
): Promise<React18Command> {
  const [command, ...commandArgs] = stripLeadingSeparator(args);

  if (!command) {
    throw new Error("Missing command. Use `ariakit react18 <script>`.");
  }

  const packageJson = await readRootPackageJson(rootPath);
  // `react18` and `test-react-18` scripts would recurse here. Run the
  // underlying test script directly instead.
  if (command === "react18" || command === "test-react-18") {
    log(`Mapping ${command} to test to avoid recursion`);
    return {
      bin: "pnpm",
      args: ["run", "test", ...commandArgs],
    };
  }
  if (packageJson.scripts?.[command]) {
    return {
      bin: "pnpm",
      args: ["run", command, ...commandArgs],
    };
  }

  return {
    bin: command,
    args: commandArgs,
  };
}

async function copyWatchedFile(
  rootPath: string,
  workspacePath: string,
  path: string,
) {
  const normalizedPath = normalizePath(path);
  if (shouldIgnoreWatchPath(rootPath, normalizedPath)) return;

  const sourcePath = join(rootPath, normalizedPath);
  const targetPath = join(workspacePath, normalizedPath);

  try {
    await mkdir(dirname(targetPath), { recursive: true });
    await copyFile(sourcePath, targetPath);
  } catch (error) {
    if (isErrnoException(error) && error.code === "ENOENT") return;
    throw error;
  }
}

async function removeWatchedPath(
  rootPath: string,
  workspacePath: string,
  path: string,
) {
  const normalizedPath = normalizePath(path);
  if (shouldIgnoreWatchPath(rootPath, normalizedPath)) return;

  await rm(join(workspacePath, normalizedPath), {
    recursive: true,
    force: true,
  });
}

function logWatcherPromise(promise: Promise<unknown>) {
  void promise.catch((error) => console.error(error));
}

function startWorkspaceWatcher(rootPath: string, workspacePath: string) {
  const watcher = watch(".", {
    cwd: rootPath,
    ignoreInitial: true,
    ignored: (path) => shouldIgnoreWatchPath(rootPath, path),
  });

  watcher
    .on("add", (path) =>
      logWatcherPromise(copyWatchedFile(rootPath, workspacePath, path)),
    )
    .on("change", (path) =>
      logWatcherPromise(copyWatchedFile(rootPath, workspacePath, path)),
    )
    .on("addDir", (path) => {
      if (shouldIgnoreWatchPath(rootPath, path)) return;
      logWatcherPromise(
        mkdir(join(workspacePath, normalizePath(path)), { recursive: true }),
      );
    })
    .on("unlink", (path) =>
      logWatcherPromise(removeWatchedPath(rootPath, workspacePath, path)),
    )
    .on("unlinkDir", (path) =>
      logWatcherPromise(removeWatchedPath(rootPath, workspacePath, path)),
    )
    .on("error", (error) => console.error(error));

  return watcher;
}

async function closeWatcher(watcher: FSWatcher) {
  await watcher.close();
}

function formatCommand(command: React18Command) {
  return [command.bin, ...command.args].join(" ");
}

function getCommandEnv(workspacePath: string) {
  return {
    ...process.env,
    [pathKey]: [
      join(workspacePath, "node_modules", ".bin"),
      process.env[pathKey],
    ]
      .filter(Boolean)
      .join(delimiter),
  };
}

export async function react18(args: string[]) {
  if (isHelpCommand(args)) {
    printHelp();
    process.exitCode = args.length ? 0 : 1;
    return;
  }

  const rootPath = getRepositoryRoot();
  const workspacePath = getWorkspacePath(rootPath);

  log(`Syncing workspace to ${workspacePath}`);
  await syncWorkspace(rootPath, workspacePath);

  const updatedCount = await rewriteReactDependencies(workspacePath);
  log(`Rewrote React dependencies in ${updatedCount} package.json files`);

  log("Installing React 18 dependency graph");
  await runChecked(
    "pnpm",
    ["install", "--no-frozen-lockfile", "--prefer-offline"],
    { cwd: workspacePath },
  );

  const command = await getReact18Command(workspacePath, args);
  const watcher = startWorkspaceWatcher(rootPath, workspacePath);

  try {
    log(`Running ${formatCommand(command)}`);
    process.exitCode = await runCommand(command.bin, command.args, {
      cwd: workspacePath,
      env: getCommandEnv(workspacePath),
    });
  } finally {
    await closeWatcher(watcher);
  }
}
