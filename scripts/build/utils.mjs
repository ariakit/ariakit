// @ts-check
import {
  existsSync,
  lstatSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "fs";
import { dirname, join } from "path";
import chalk from "chalk";
import fse from "fs-extra";
import { rimrafSync } from "rimraf";

/**
 * Converts ./path/to/file.js to ./path/to
 * @param {string} dir
 */
function resolveDir(dir) {
  if (!/\.(c|m)?(t|j)s$/.test(dir)) {
    return dir;
  }
  return dirname(dir);
}

/**
 * @param {string} path
 */
function isDirectory(path) {
  return lstatSync(path).isDirectory();
}

/**
 * @param {string} path
 */
export function removeExt(path) {
  return path.replace(/\.[^.]+$/, "");
}

/**
 * @param {string} rootPath
 * @returns {Record<string, any>}
 */
export function getPackage(rootPath) {
  const pkgPath = join(rootPath, "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
  const nextPkg = {
    ...pkg,
    main: "cjs/index.cjs",
    module: "esm/index.js",
    types: "cjs/index.d.ts",
    exports: {
      ".": {
        import: "./esm/index.js",
        require: "./cjs/index.cjs",
      },
      "./*": {
        import: "./esm/*.js",
        require: "./cjs/*.cjs",
      },
      "./__chunks/*": null,
      "./package.json": "./package.json",
    },
    __dev: {
      main: pkg.main,
      module: pkg.module,
      types: pkg.types,
      exports: pkg.exports,
      ...pkg.__dev,
    },
  };
  return nextPkg;
}

/**
 * @param {string} rootPath
 */
export function writeBuildPackage(rootPath) {
  const pkgPath = join(rootPath, "package.json");
  const pkg = getPackage(rootPath);
  writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
}

/**
 * @param {string} rootPath
 */
export function restoreBuildPackage(rootPath) {
  const pkgPath = join(rootPath, "package.json");
  const { __dev, ...pkg } = getPackage(rootPath);
  const nextPkg = { ...pkg, ...__dev };
  writeFileSync(pkgPath, `${JSON.stringify(nextPkg, null, 2)}\n`);
}

/**
 * @param {string} rootPath
 */
export function getModuleDir(rootPath) {
  const { module } = getPackage(rootPath);
  if (!module) return "esm";
  return resolveDir(module);
}

/**
 * @param {string} rootPath
 */
export function getMainDir(rootPath) {
  const { main } = getPackage(rootPath);
  if (!main) return "cjs";
  return resolveDir(main);
}

/**
 * @param {string} rootPath
 */
export function getSourcePath(rootPath) {
  return join(rootPath, "src");
}

/**
 * Ensure that paths are consistent across Windows and non-Windows platforms.
 * @param {string} filePath
 */
function normalizePath(filePath) {
  return filePath.replace(/\\/g, "/");
}

/**
 * Filters out files starting with __
 * Includes directories and TS/JS files.
 * @param {string} rootPath
 * @param {string} filename
 */
function isPublicModule(rootPath, filename) {
  const isPrivate = /^__/.test(filename);
  if (isPrivate) return false;
  if (isDirectory(join(rootPath, filename))) return true;
  return /\.(j|t)sx?$/.test(filename);
}

/**
 * Returns { index: "path/to/index", moduleName: "path/to/moduleName" }
 * @param {string} rootPath
 * @param {string} prefix
 * @returns {Record<string, string>}
 */
export function getPublicFiles(rootPath, prefix = "") {
  return readdirSync(rootPath)
    .filter((filename) => isPublicModule(rootPath, filename))
    .sort() // Ensure consistent order across platforms
    .reduce((acc, filename) => {
      const path = join(rootPath, filename);
      const childFiles =
        isDirectory(path) && getPublicFiles(path, join(prefix, filename));
      return {
        ...(childFiles || {
          [removeExt(normalizePath(join(prefix, filename)))]:
            normalizePath(path),
        }),
        ...acc,
      };
    }, {});
}

/**
 * Returns ["module", "path/to/module", ...]
 * @param {string} rootPath
 */
export function getProxyFolders(rootPath) {
  const publicFiles = getPublicFiles(getSourcePath(rootPath));
  return Object.keys(publicFiles)
    .map((name) => name.replace(/\/index$/, ""))
    .filter((name) => name !== "index");
}

/**
 * Returns ["lib", "es", "dist", "ts", "moduleName", ...]
 * @param {string} rootPath
 * @returns {string[]}
 */
export function getBuildFolders(rootPath) {
  return [
    getMainDir(rootPath),
    getModuleDir(rootPath),
    ...getProxyFolders(rootPath),
  ];
}

/**
 * @param {string} path
 */
function getRootPath(path) {
  return path.replace(/^([^/]+).*$/, "$1");
}

/**
 * @param {string} path
 * @param {number} _
 * @param {string[]} array
 */
function isRootModule(path, _, array) {
  const rootPath = getRootPath(path);
  return path === rootPath || !array.includes(rootPath);
}

/**
 * @param {string[]} array
 * @param {string} path
 */
function reduceToRootPaths(array, path) {
  const rootPath = getRootPath(path);
  if (array.includes(rootPath)) return array;
  return [...array, rootPath];
}

/**
 * @param {string} rootPath
 */
export function cleanBuild(rootPath) {
  const pkg = getPackage(rootPath);

  restoreBuildPackage(rootPath);
  const cleaned = [chalk.bold(chalk.gray("package.json"))];

  getBuildFolders(rootPath)
    .filter(isRootModule)
    .reduce(reduceToRootPaths, [])
    .forEach((name) => {
      rimrafSync(name);
      cleaned.push(chalk.bold(chalk.gray(name)));
    });

  if (cleaned.length) {
    console.log(
      ["", `Cleaned in ${chalk.bold(pkg.name)}:`, `${cleaned.join(", ")}`].join(
        "\n"
      )
    );
  }
}

/**
 * @param {string} path
 */
export function getIndexPath(path) {
  const index = readdirSync(path).find((file) => /^index\.(j|t)sx?/.test(file));
  if (!index) {
    throw new Error(`Missing index file in ${path}`);
  }
  return join(path, index);
}

/**
 * @param {string} rootPath
 */
export function makeGitignore(rootPath) {
  const pkg = getPackage(rootPath);
  const buildFolders = getBuildFolders(rootPath);
  const contents = buildFolders
    .filter(isRootModule)
    .reduce(reduceToRootPaths, [])
    .sort() // Ensure that the order is consistent across platforms
    .map((name) => `/${name}`)
    .join("\n");
  writeFileSync(
    join(rootPath, ".gitignore"),
    `# Automatically generated\n${contents}\n`
  );
  console.log(
    `\nCreated in ${chalk.bold(pkg.name)}: ${chalk.bold(
      chalk.green(".gitignore")
    )}`
  );
}

/**
 * @param {string} rootPath
 * @param {string} moduleName
 */
function getProxyPackageContents(rootPath, moduleName) {
  const { name } = getPackage(rootPath);
  const mainDir = getMainDir(rootPath);
  const moduleDir = getModuleDir(rootPath);
  const prefix = "../".repeat(moduleName.split("/").length);
  const json = {
    name: `${name}/${moduleName}`,
    private: true,
    sideEffects: false,
    main: join(prefix, mainDir, moduleName),
    module: join(prefix, moduleDir, moduleName),
  };
  return JSON.stringify(json, null, 2);
}

/**
 * @param {string} rootPath
 */
export function makeProxies(rootPath) {
  const pkg = getPackage(rootPath);
  const created = [];
  getProxyFolders(rootPath).forEach((name) => {
    fse.ensureDirSync(name);
    writeFileSync(
      `${name}/package.json`,
      getProxyPackageContents(rootPath, name)
    );
    created.push(chalk.bold(chalk.green(name)));
  });
  if (created.length) {
    console.log(
      [
        "",
        `Created proxies in ${chalk.bold(pkg.name)}:`,
        `${created.join(", ")}`,
      ].join("\n")
    );
  }
}
