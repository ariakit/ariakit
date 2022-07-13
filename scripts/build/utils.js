// @ts-check
const { join, dirname } = require("path");
const chalk = require("chalk");
const {
  readdirSync,
  ensureDirSync,
  writeFileSync,
  readFileSync,
  lstatSync,
  existsSync,
  removeSync,
} = require("fs-extra");
const rimraf = require("rimraf");

/**
 * Converts ./path/to/file.js to ./path/to
 * @param {string} dir
 */
function resolveDir(dir) {
  if (!/\.(t|j)s$/.test(dir)) {
    return dir;
  }
  return dirname(dir);
}

/**
 * @param {string} rootPath
 * @returns {object}
 */
function getPackage(rootPath) {
  return require(join(rootPath, "package.json"));
}

/**
 * @param {string} rootPath
 */
function getModuleDir(rootPath) {
  const pkg = getPackage(rootPath);
  try {
    return resolveDir(pkg.module);
  } catch (e) {
    // resolveDir will throw an error if pkg.module doesn't exist
    // we just return false here.
    return false;
  }
}

/**
 * @param {string} rootPath
 */
function getUnpkgDir(rootPath) {
  const pkg = getPackage(rootPath);
  try {
    return resolveDir(pkg.unpkg);
  } catch (e) {
    return false;
  }
}

/**
 * @param {string} rootPath
 */
function getTypesDir(rootPath) {
  const pkg = getPackage(rootPath);
  try {
    return resolveDir(pkg.types || pkg.typings);
  } catch (e) {
    return false;
  }
}

/**
 * @param {string} rootPath
 */
function getMainDir(rootPath) {
  const { main } = getPackage(rootPath);
  return resolveDir(main);
}

/**
 * @param {string} path
 */
function removeExt(path) {
  return path.replace(/\.[^.]+$/, "");
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
  if (array.includes(rootPath)) {
    return array;
  }
  return [...array, rootPath];
}

/**
 * @param {string} path
 */
function isDirectory(path) {
  return lstatSync(path).isDirectory();
}

/**
 * @param {string} rootPath
 */
function getSourcePath(rootPath) {
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
  if (isPrivate) {
    return false;
  }
  if (isDirectory(join(rootPath, filename))) {
    return true;
  }
  return /\.(j|t)sx?$/.test(filename);
}

/**
 * Returns { index: "path/to/index", moduleName: "path/to/moduleName" }
 * @param {string} rootPath
 * @param {string} prefix
 * @returns {Record<string, string>}
 */
function getPublicFiles(rootPath, prefix = "") {
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
function getProxyFolders(rootPath) {
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
function getBuildFolders(rootPath) {
  // @ts-ignore
  return [
    getMainDir(rootPath),
    getUnpkgDir(rootPath),
    getModuleDir(rootPath),
    getTypesDir(rootPath),
    ...getProxyFolders(rootPath),
  ].filter(Boolean);
}

/**
 * @param {string} rootPath
 */
function cleanBuild(rootPath) {
  const pkg = getPackage(rootPath);
  const cleaned = [];
  getBuildFolders(rootPath)
    .filter(isRootModule)
    .reduce(reduceToRootPaths, [])
    .forEach((name) => {
      rimraf.sync(name);
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
function getIndexPath(path) {
  const index = readdirSync(path).find((file) => /^index\.(j|t)sx?/.test(file));
  if (!index) {
    throw new Error(`Missing index file in ${path}`);
  }
  return join(path, index);
}

/**
 * @param {string} rootPath
 */
function makeGitignore(rootPath) {
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
  const typesDir = getTypesDir(rootPath);
  const prefix = "../".repeat(moduleName.split("/").length);
  const tsModuleName = existsSync(join(getSourcePath(rootPath), moduleName))
    ? `${moduleName}/index.d.ts`
    : `${moduleName}.d.ts`;
  const json = {
    name: `${name}/${moduleName}`,
    private: true,
    sideEffects: false,
    main: join(prefix, mainDir, moduleName),
    ...(moduleDir ? { module: join(prefix, moduleDir, moduleName) } : {}),
    ...(typesDir ? { types: join(prefix, typesDir, tsModuleName) } : {}),
  };
  return JSON.stringify(json, null, 2);
}

/**
 * @param {string} rootPath
 */
function makeProxies(rootPath) {
  const pkg = getPackage(rootPath);
  const created = [];
  getProxyFolders(rootPath).forEach((name) => {
    ensureDirSync(name);
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

/**
 * @param {string} rootPath
 */
function hasTSConfig(rootPath) {
  return existsSync(join(rootPath, "tsconfig.json"));
}

/**
 * @param {string} rootPath
 */
function makeTSConfigProd(rootPath) {
  const filepath = join(rootPath, "tsconfig.json");
  const content = readFileSync(filepath, "utf-8");
  const json = JSON.parse(content);
  json.extends = json.extends.replace("tsconfig.json", "tsconfig.prod.json");
  json.exclude = [...(json.exlcude || []), "src/**/__*"];
  writeFileSync(filepath, JSON.stringify(json, null, 2));
  return function restoreTSConfig() {
    writeFileSync(filepath, content);
  };
}

/**
 * @param {string} rootPath
 */
function makeExports(rootPath) {
  const pkg = getPackage(rootPath);
  const filepath = join(rootPath, "package.json");
  const content = readFileSync(filepath, "utf-8");
  const publicFiles = getPublicFiles(getSourcePath(rootPath));
  const mainDir = getMainDir(rootPath);
  const moduleDir = getModuleDir(rootPath);
  const typesDir = getTypesDir(rootPath);
  const keys = Object.keys(publicFiles);
  const obj = {};

  for (const moduleName of keys) {
    const name = `./${moduleName.replace(/\/?index$/, "")}`.replace(
      /^\.\/$/,
      "."
    );
    const tsModuleName = existsSync(join(getSourcePath(rootPath), moduleName))
      ? `${moduleName}/index.d.ts`
      : `${moduleName}.d.ts`;
    obj[name] = {
      require: `./${mainDir}/${moduleName}.js`,
      ...(moduleDir ? { import: `./${moduleDir}/${moduleName}.js` } : {}),
      ...(typesDir ? { types: `./${typesDir}/${tsModuleName}` } : {}),
    };
  }

  pkg.exports = obj;

  writeFileSync(filepath, `${JSON.stringify(pkg, null, 2)}\n`);
  writeFileSync(join(rootPath, "package.json.backup"), content);
}

/**
 * @param {string} rootPath
 */
function cleanExports(rootPath) {
  const pkg = getPackage(rootPath);
  const filepath = join(rootPath, "package.json");
  const backupPath = join(rootPath, "package.json.backup");
  const content = readFileSync(filepath, "utf-8");
  writeFileSync(filepath, content);
  removeSync(backupPath);
}

/**
 * @param {NodeJS.ExitListener} callback
 */
function onExit(callback) {
  process.on("exit", callback);
  process.on("SIGINT", callback);
  process.on("SIGUSR1", callback);
  process.on("SIGUSR2", callback);
  process.on("uncaughtException", callback);
}

module.exports = {
  getPackage,
  getModuleDir,
  getUnpkgDir,
  getTypesDir,
  getMainDir,
  getSourcePath,
  getPublicFiles,
  getProxyFolders,
  getBuildFolders,
  cleanBuild,
  getIndexPath,
  makeGitignore,
  makeProxies,
  hasTSConfig,
  makeTSConfigProd,
  makeExports,
  cleanExports,
  onExit,
};
