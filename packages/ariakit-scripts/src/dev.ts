import { spawn } from "node:child_process";
import { readdir } from "node:fs/promises";
import { createServer } from "node:net";
import { isAbsolute, join, relative } from "node:path";
import { watch } from "chokidar";
import { cleanPackage } from "./build.ts";
import { normalizePath, readPackageJson } from "./utils.ts";

interface DevOptions {
  clean?: boolean;
}

interface CleanPackage {
  path: string;
}

interface PackageWatcher {
  on(event: string, listener: (filename: string) => void): PackageWatcher;
}

interface WatchPackageChangesOptions {
  cleanPackages?: typeof cleanPackages;
  watch?: (
    path: string,
    options: {
      ignoreInitial: boolean;
      ignored: (path: string) => boolean;
    },
  ) => PackageWatcher;
}

const watchedPackageEntries = new Set(["package.json", "src"]);

export function shouldIgnorePackageWatchPath(filename: string) {
  const relativePath = isAbsolute(filename)
    ? relative(process.cwd(), filename)
    : filename;
  const normalizedPath = normalizePath(relativePath);
  const [root, packageName, entry] = normalizedPath.split("/");

  if (root !== "packages") return false;
  if (!packageName) return false;
  if (!entry) return false;

  return !watchedPackageEntries.has(entry);
}

function getCleanPackage(rootPath: string): CleanPackage | undefined {
  try {
    const packageJson = readPackageJson(rootPath);
    const cleanScript = packageJson.scripts?.clean;

    if (!cleanScript) return;

    return {
      path: rootPath,
    };
  } catch {
    return;
  }
}

async function getCleanPackages() {
  const packagesPath = join(process.cwd(), "packages");
  const entries = await readdir(packagesPath, { withFileTypes: true });
  const packages: CleanPackage[] = [];
  const sortedEntries = entries.sort((a, b) => a.name.localeCompare(b.name));

  for (const entry of sortedEntries) {
    if (!entry.isDirectory()) continue;

    const packagePath = join(packagesPath, entry.name);
    const cleanPackage = getCleanPackage(packagePath);

    if (!cleanPackage) continue;

    packages.push(cleanPackage);
  }

  return packages;
}

function getPackagePath(filename: string) {
  const path = isAbsolute(filename) ? filename : join(process.cwd(), filename);
  const relativePath = normalizePath(relative(process.cwd(), path));
  const [root, packageName, entry] = relativePath.split("/");

  if (root !== "packages") return;
  if (!packageName) return;
  if (!entry) return;
  if (!watchedPackageEntries.has(entry)) return;

  return join(process.cwd(), "packages", packageName);
}

async function cleanPackages(packages: CleanPackage[]) {
  for (const pkg of packages) {
    await cleanPackage(pkg.path);
  }
}

export function watchPackageChanges(options: WatchPackageChangesOptions = {}) {
  const watchPackages = options.watch ?? watch;
  const cleanPackageList = options.cleanPackages ?? cleanPackages;
  let timeout: NodeJS.Timeout | undefined;
  let queue = Promise.resolve();
  const pendingPackagePaths = new Set<string>();

  const runClean = () => {
    const packages = [...pendingPackagePaths]
      .map(getCleanPackage)
      .filter((pkg): pkg is CleanPackage => !!pkg)
      .sort((a, b) => a.path.localeCompare(b.path));
    pendingPackagePaths.clear();
    if (!packages.length) return;
    queue = queue
      .then(() => cleanPackageList(packages))
      .catch((error) => console.error(error));
  };

  const scheduleClean = (filename: string) => {
    const packagePath = getPackagePath(filename);
    if (!packagePath) return;
    if (!getCleanPackage(packagePath)) return;

    pendingPackagePaths.add(packagePath);
    clearTimeout(timeout);
    timeout = setTimeout(runClean, 100);
  };

  watchPackages("packages", {
    ignoreInitial: true,
    ignored: shouldIgnorePackageWatchPath,
  })
    .on("add", scheduleClean)
    .on("change", scheduleClean)
    .on("unlink", scheduleClean)
    .on("unlinkDir", scheduleClean);
}

/**
 * Finds the first available TCP port starting from the given port number.
 */
async function findAvailablePort(
  start: number,
  excludedPorts: number[] = [],
): Promise<number> {
  let port = start;
  while (true) {
    if (excludedPorts.includes(port)) {
      port += 1;
      continue;
    }

    const available = await new Promise<boolean>((resolve, reject) => {
      const server = createServer();
      server.once("error", (error: NodeJS.ErrnoException) => {
        if (error.code === "EADDRINUSE") {
          resolve(false);
          return;
        }
        reject(error);
      });
      server.once("listening", () => {
        server.close(() => resolve(true));
      });
      server.listen(port);
    });
    if (available) return port;
    port += 1;
  }
}

export async function dev(options: DevOptions = {}) {
  if (options.clean !== false) {
    await cleanPackages(await getCleanPackages());
    watchPackageChanges();
  }

  const appPort = await findAvailablePort(Number(process.env.APP_PORT) || 4321);
  const nextjsPort = await findAvailablePort(
    Number(process.env.NEXTJS_PORT) || 3000,
    [appPort],
  );

  const child = spawn(
    "conc",
    [
      "-r",
      `pnpm -F app run dev --port ${appPort}`,
      `pnpm -F nextjs run dev --port ${nextjsPort}`,
    ],
    {
      stdio: "inherit",
      env: {
        ...process.env,
        // Prevent Astro from daemonizing when an agent is detected.
        ASTRO_DEV_BACKGROUND: "0",
        APP_PORT: String(appPort),
        NEXTJS_PORT: String(nextjsPort),
      },
    },
  );

  child.on("exit", (code) => process.exit(code ?? 0));
}
