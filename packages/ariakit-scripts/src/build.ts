import {
  existsSync,
  lstatSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { readdir } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { build as rolldownBuild } from "rolldown";
import { dts } from "rolldown-plugin-dts";
import solidPlugin from "vite-plugin-solid";

interface PackageJson {
  name: string;
  exports?: Record<string, unknown>;
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  main?: string;
  module?: string;
  types?: string;
  [key: string]: unknown;
}

interface PublicFile {
  name: string;
  path: string;
  source: string;
}

interface BuildOptions {
  clean?: boolean;
  indexOnly?: boolean;
  updateExports?: boolean;
}

const sourceDir = "src";
const distDir = "dist";
const solidDir = "solid";

function normalizePath(path: string) {
  return path.split(sep).join("/");
}

function removeExtension(path: string) {
  return path.replace(/\.[^.]+$/, "");
}

function isTypeScriptSource(filename: string) {
  return /\.[jt]sx?$/.test(filename);
}

function isPrivateModule(filename: string) {
  return filename.startsWith("__");
}

function readPackageJson(rootPath: string): PackageJson {
  const packageJsonPath = join(rootPath, "package.json");
  return JSON.parse(readFileSync(packageJsonPath, "utf-8"));
}

function writePackageJson(rootPath: string, packageJson: PackageJson) {
  const packageJsonPath = join(rootPath, "package.json");
  writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);
}

function isDirectory(path: string) {
  return lstatSync(path).isDirectory();
}

async function getPublicFiles(rootPath: string, prefix = "") {
  const files: PublicFile[] = [];
  const entries = await readdir(rootPath);
  const sortedEntries = entries.sort((a, b) => a.localeCompare(b));

  for (const entry of sortedEntries) {
    if (isPrivateModule(entry)) continue;

    const entryPath = join(rootPath, entry);
    const prefixedPath = join(prefix, entry);

    if (isDirectory(entryPath)) {
      const childFiles = await getPublicFiles(entryPath, prefixedPath);
      files.push(...childFiles);
      continue;
    }

    if (!isTypeScriptSource(entry)) continue;

    files.push({
      name: removeExtension(normalizePath(prefixedPath)),
      path: entryPath,
      source: `./${normalizePath(relative(process.cwd(), entryPath))}`,
    });
  }

  return files;
}

async function getIndexFile(rootPath: string) {
  const files = await getPublicFiles(rootPath);
  const indexFile = files.find((file) => file.name === "index");

  if (!indexFile) {
    throw new Error(`Missing ${sourceDir}/index.ts entrypoint`);
  }

  return [indexFile];
}

function getExportName(name: string) {
  if (name === "index") return ".";
  return `./${name.replace(/\/index$/, "")}`;
}

function getExportValue(file: PublicFile, isSolid: boolean) {
  const name = file.name;
  return {
    "ariakit-source": file.source,
    types: `./${distDir}/${name}.d.ts`,
    ...(isSolid && { solid: `./${solidDir}/${name}.jsx` }),
    import: `./${distDir}/${name}.js`,
  };
}

async function updatePackageExports(
  rootPath: string,
  publicFiles: PublicFile[],
) {
  const packageJson = readPackageJson(rootPath);
  const isSolid = packageJson.name.includes("/solid");
  const exports = Object.fromEntries(
    publicFiles.map((file) => [
      getExportName(file.name),
      getExportValue(file, isSolid),
    ]),
  );

  delete packageJson.main;
  delete packageJson.module;
  delete packageJson.types;

  packageJson.exports = {
    ...exports,
    "./package.json": "./package.json",
  };

  writePackageJson(rootPath, packageJson);
}

function getExternal(packageJson: PackageJson) {
  const dependencies = {
    ...packageJson.dependencies,
    ...packageJson.peerDependencies,
  };
  const packageNames = Object.keys(dependencies);

  return (id: string) => {
    return packageNames.some(
      (name) => id === name || id.startsWith(`${name}/`),
    );
  };
}

function getInput(publicFiles: PublicFile[]) {
  return Object.fromEntries(publicFiles.map((file) => [file.name, file.path]));
}

function hasJsxPublicFile(publicFiles: PublicFile[]) {
  return publicFiles.some((file) => /\.[jt]sx$/.test(file.path));
}

function cleanOutput(rootPath: string, isSolid: boolean) {
  const folders = [distDir, ...(isSolid ? [solidDir] : [])];
  for (const folder of folders) {
    rmSync(join(rootPath, folder), { recursive: true, force: true });
  }
}

function writeGitignore(rootPath: string, isSolid: boolean) {
  const folders = [distDir, ...(isSolid ? [solidDir] : [])];
  const contents = [
    "# Automatically generated",
    ...folders.map((folder) => `/${folder}`),
  ];
  writeFileSync(join(rootPath, ".gitignore"), `${contents.join("\n")}\n`);
}

function writeNpmignore(rootPath: string) {
  const contents = [
    "# Automatically generated",
    "coverage",
    "tsconfig*.json",
    "*.log",
    "*.config.*",
    "*.lock",
  ];
  writeFileSync(join(rootPath, ".npmignore"), `${contents.join("\n")}\n`);
}

function getTsconfig(rootPath: string) {
  for (const filename of [
    "tsconfig.build.json",
    "tsconfig.node.json",
    "tsconfig.json",
  ]) {
    if (existsSync(join(rootPath, filename))) {
      return filename;
    }
  }
  return false;
}

async function buildSolidSource(
  rootPath: string,
  input: Record<string, string>,
) {
  await rolldownBuild({
    input,
    tsconfig: getTsconfig(rootPath),
    external: getExternal(readPackageJson(rootPath)),
    transform: {
      jsx: "preserve",
    },
    output: {
      dir: solidDir,
      cleanDir: true,
      format: "es",
      entryFileNames: "[name].jsx",
      chunkFileNames: "__chunks/[hash].jsx",
      sourcemap: true,
    },
  });
}

async function buildDist(rootPath: string, publicFiles: PublicFile[]) {
  const packageJson = readPackageJson(rootPath);
  const isReactPackage = packageJson.name.includes("/react");
  const isSolid = packageJson.name.includes("/solid");
  const shouldTransformReactJsx =
    isReactPackage || (!isSolid && hasJsxPublicFile(publicFiles));

  await rolldownBuild({
    input: getInput(publicFiles),
    tsconfig: getTsconfig(rootPath),
    external: getExternal(packageJson),
    transform: shouldTransformReactJsx
      ? {
          jsx: "react-jsx",
        }
      : undefined,
    output: {
      dir: distDir,
      cleanDir: true,
      format: "es",
      banner: isReactPackage ? '"use client";' : undefined,
      entryFileNames: "[name].js",
      chunkFileNames: "__chunks/[hash].js",
      sourcemap: true,
    },
    plugins: [
      ...(isSolid ? [solidPlugin({ solid: { generate: "dom" } })] : []),
      dts({
        tsconfig: getTsconfig(rootPath),
        compilerOptions: {
          customConditions: ["ariakit-source"],
        },
      }),
    ],
  });

  if (isSolid) {
    await buildSolidSource(rootPath, getInput(publicFiles));
  }
}

export async function build(options: BuildOptions) {
  const rootPath = process.cwd();
  const packageJson = readPackageJson(rootPath);
  const isSolid = packageJson.name.includes("/solid");

  if (options.clean) {
    cleanOutput(rootPath, isSolid);
    return;
  }

  const sourcePath = join(rootPath, sourceDir);
  const publicFiles = options.indexOnly
    ? await getIndexFile(sourcePath)
    : await getPublicFiles(sourcePath);

  if (options.updateExports) {
    await updatePackageExports(rootPath, publicFiles);
    writeGitignore(rootPath, isSolid);
    writeNpmignore(rootPath);
  }

  await buildDist(rootPath, publicFiles);
}
