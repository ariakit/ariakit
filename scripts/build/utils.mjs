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
  return JSON.parse(readFileSync(pkgPath, "utf-8"));
}

/**
 * @param {string} rootPath
 */
export function getBuildPackage(rootPath) {
  const { exports: _, ...pkg } = getPackage(rootPath);
  const sourcePath = getSourcePath(rootPath);
  const publicFiles = getPublicFiles(sourcePath);
  const cjsDir = getCJSDir();
  const esmDir = getESMDir();

  /** @param {string} path */
  const getExports = (path) => {
    path = removeExt(path).replace(sourcePath, "");
    return {
      import: `./${join(esmDir, path)}.js`,
      require: `./${join(cjsDir, path)}.cjs`,
    };
  };

  const moduleExports = Object.entries(publicFiles).reduce(
    (acc, [name, path]) => {
      if (name === "index") {
        return { ".": getExports(path), ...acc };
      }
      const pathname = `./${name.replace(/\/index$/, "")}`;
      return { ...acc, [pathname]: getExports(path) };
    },
    {}
  );

  const nextPkg = {
    ...pkg,
    main: join(cjsDir, "index.cjs"),
    module: join(esmDir, "index.js"),
    types: join(cjsDir, "index.d.ts"),
    exports: {
      ...moduleExports,
      "./package.json": "./package.json",
    },
  };

  return nextPkg;
}

/**
 * @param {string} rootPath
 */
export function getDevPackage(rootPath) {
  const { exports: _, ...pkg } = getPackage(rootPath);
  const sourcePath = getSourcePath(rootPath);
  const publicFiles = getPublicFiles(sourcePath);
  const sourceDir = getSourceDir();

  /** @param {string} path */
  const getExports = (path) => path.replace(sourcePath, `./${sourceDir}`);

  const moduleExports = Object.entries(publicFiles).reduce(
    (acc, [name, path]) => {
      if (name === "index") {
        return { ".": getExports(path), ...acc };
      }
      const pathname = `./${name.replace(/\/index$/, "")}`;
      return { ...acc, [pathname]: getExports(path) };
    },
    {}
  );

  const nextPkg = {
    ...pkg,
    main: join(sourceDir, "index.ts"),
    module: join(sourceDir, "index.ts"),
    types: join(sourceDir, "index.ts"),
    exports: {
      ...moduleExports,
      "./package.json": "./package.json",
    },
  };

  return nextPkg;
}

/**
 * @param {string} rootPath
 */
export function writeBuildPackage(rootPath) {
  const pkgPath = join(rootPath, "package.json");
  const pkg = getBuildPackage(rootPath);
  writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
}
/**
 * @param {string} rootPath
 */
export function writeDevPackage(rootPath) {
  const pkgPath = join(rootPath, "package.json");
  const pkg = getDevPackage(rootPath);
  writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
}

export function getSourceDir() {
  return "src";
}

export function getESMDir() {
  return "esm";
}

export function getCJSDir() {
  return "cjs";
}

/**
 * @param {string} rootPath
 */
export function getSourcePath(rootPath) {
  return join(rootPath, getSourceDir());
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
 * @param {string} sourcePath
 * @param {string} prefix
 * @returns {Record<string, string>}
 */
export function getPublicFiles(sourcePath, prefix = "") {
  return readdirSync(sourcePath)
    .filter((filename) => isPublicModule(sourcePath, filename))
    .sort() // Ensure consistent order across platforms
    .reduce((acc, filename) => {
      const path = join(sourcePath, filename);
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
  return [getCJSDir(), getESMDir(), ...getProxyFolders(rootPath)];
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

  writeDevPackage(rootPath);
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
  const index = readdirSync(path).find((file) =>
    /^index\.(c|m)?(j|t)sx?/.test(file)
  );
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
  const mainDir = getCJSDir();
  const moduleDir = getESMDir();
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
