const { join, dirname } = require("path");
const rimraf = require("rimraf");
const chalk = require("chalk");
const {
  readdirSync,
  ensureDirSync,
  writeFileSync,
  readFileSync,
  lstatSync,
  existsSync,
} = require("fs-extra");

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
 * @param {number} index
 * @param {string[]} array
 */
function isRootModule(path, index, array) {
  const rootPath = path.replace(/^([^/]+).*$/, "$1");
  return path === rootPath || !array.includes(rootPath);
}

/**
 * Filters out /dist, /es, /lib, /ts etc.
 * @param {string} rootPath
 * @param {string} filename
 */
function isSourceModule(rootPath, filename) {
  const dists = [
    getModuleDir(rootPath),
    getUnpkgDir(rootPath),
    getTypesDir(rootPath),
    getMainDir(rootPath),
  ];
  return !dists.includes(filename);
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
 * Returns the same as getPublicFiles, but grouped by modules.
 * Like { "path/to/moduleName": ["path/to/moduleName/file1", "path/to/moduleName/file2"] }
 * @param {string} rootPath
 */
function getPublicFilesByModules(rootPath) {
  const publicFiles = getPublicFiles(rootPath);
  return Object.values(publicFiles).reduce((acc, path) => {
    const moduleName = dirname(path);
    acc[moduleName] = [...(acc[moduleName] || []), path];
    return acc;
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
 */
function getBuildFolders(rootPath) {
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
  return join(
    path,
    readdirSync(path).find((file) => /^index\.(j|t)sx?/.test(file))
  );
}

/**
 * @param {string} rootPath
 */
function makeGitignore(rootPath) {
  const pkg = getPackage(rootPath);
  const buildFolders = getBuildFolders(rootPath);
  const contents = buildFolders
    .filter(isRootModule)
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
  const json = {
    name: `${name}/${moduleName}`,
    private: true,
    sideEffects: false,
    main: join(prefix, mainDir, moduleName),
    ...(moduleDir ? { module: join(prefix, moduleDir, moduleName) } : {}),
    ...(typesDir ? { types: join(prefix, typesDir, moduleName) } : {}),
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
  const contents = readFileSync(filepath);
  const json = JSON.parse(contents);
  json.extends = json.extends.replace("tsconfig.json", "tsconfig.prod.json");
  json.exclude = [...(json.exlcude || []), "src/**/__*"];
  writeFileSync(filepath, JSON.stringify(json, null, 2));
  return function restoreTSConfig() {
    writeFileSync(filepath, contents);
  };
}

/**
 * @param {Function} callback
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
  onExit,
};
