const {
  readdirSync,
  ensureDirSync,
  writeFileSync,
  lstatSync,
  existsSync
} = require("fs-extra");
const { join, dirname } = require("path");
const rimraf = require("rimraf");
const log = require("../log");

// converts ./path/to/file.js to ./path/to
function resolveDir(dir) {
  if (!/\.(t|j)s$/.test(dir)) {
    return dir;
  }
  return dirname(dir);
}

function getPackage(rootPath) {
  // eslint-disable-next-line import/no-dynamic-require, global-require
  return require(join(rootPath, "package.json"));
}

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

function getUnpkgDir(rootPath) {
  const pkg = getPackage(rootPath);
  try {
    return resolveDir(pkg.unpkg);
  } catch (e) {
    return false;
  }
}

function getTypesDir(rootPath) {
  const pkg = getPackage(rootPath);
  try {
    return resolveDir(pkg.types || pkg.typings);
  } catch (e) {
    return false;
  }
}

function getMainDir(rootPath) {
  const { main } = getPackage(rootPath);
  return resolveDir(main);
}

function removeExt(path) {
  return path.replace(/\.[^.]+$/, "");
}

function isRootModule(path) {
  return !/\//.test(path);
}

// filters out /dist, /es, /lib, /ts etc.
function isSourceModule(rootPath, filename) {
  const dists = [
    getModuleDir(rootPath),
    getUnpkgDir(rootPath),
    getTypesDir(rootPath),
    getMainDir(rootPath)
  ];
  return !dists.includes(filename);
}

function isDirectory(path) {
  return lstatSync(path).isDirectory();
}

function getSourcePath(rootPath) {
  return join(rootPath, "src");
}

// filters out files starting with __
// includes directories and TS/JS files
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

// returns { index: "path/to/index", moduleName: "path/to/moduleName" }
function getPublicFiles(rootPath, prefix = "") {
  return readdirSync(rootPath)
    .filter(filename => isPublicModule(rootPath, filename))
    .reduce((acc, filename) => {
      const path = join(rootPath, filename);
      const childFiles = isDirectory(path) && getPublicFiles(path, filename);
      return {
        ...(childFiles || { [removeExt(join(prefix, filename))]: path }),
        ...acc
      };
    }, {});
}

// returns ["module", "path/to/module", ...]
function getProxyFolders(rootPath) {
  const publicFiles = getPublicFiles(getSourcePath(rootPath));
  return Object.keys(publicFiles)
    .map(name => name.replace(/\/index$/, ""))
    .filter(name => name !== "index");
}

// returns ["lib", "es", "dist", "ts", "moduleName", ...]
function getBuildFolders(rootPath) {
  return [
    getMainDir(rootPath),
    getUnpkgDir(rootPath),
    getModuleDir(rootPath),
    getTypesDir(rootPath),
    ...getProxyFolders(rootPath)
  ].filter(Boolean);
}

function cleanBuild(rootPath) {
  log(`Cleaning ${rootPath}`);
  return getBuildFolders(rootPath)
    .filter(isRootModule)
    .forEach(name => {
      try {
        rimraf.sync(name);
        log(`Cleaned ${name}`);
      } catch (e) {
        log(`Couldn't clean ${name}`);
      }
    });
}

function getIndexPath(path) {
  return join(
    path,
    readdirSync(path).find(file => /^index\.(j|t)sx?/.test(file))
  );
}

function makeGitignore(rootPath) {
  const buildFolders = getBuildFolders(rootPath);
  const contents = buildFolders
    .filter(isRootModule)
    .map(name => `/${name}`)
    .join("\n");
  writeFileSync(
    join(rootPath, ".gitignore"),
    `# Automatically generated\n${contents}\n`
  );
  log(`Created .gitignore in ${rootPath}`);
}

function makeModulesJSON(rootPath) {
  const buildFolders = getBuildFolders(rootPath);
  const { name } = getPackage(rootPath);
  const folders = buildFolders
    .filter(filename => isSourceModule(rootPath, filename))
    .map(folder => `${name}/${folder}`);
  const contents = [name, ...folders];
  writeFileSync(
    join(rootPath, "modules.json"),
    `${JSON.stringify(contents, null, 2)}\n`
  );
  log(`Created modules.json in ${rootPath}`);
}

function getProxyPackageContents(rootPath, moduleName) {
  const { name } = getPackage(rootPath);
  const mainDir = getMainDir(rootPath);
  const moduleDir = getModuleDir(rootPath);
  const typesDir = getTypesDir(rootPath);
  const prefix = "../".repeat(moduleName.split("/").length);
  const json = {
    name: `${name}/${moduleName}`,
    private: true,
    main: join(prefix, mainDir, moduleName),
    ...(moduleDir ? { module: join(prefix, moduleDir, moduleName) } : {}),
    ...(typesDir ? { types: join(prefix, typesDir, moduleName) } : {})
  };
  return JSON.stringify(json, null, 2);
}

function makeProxies(rootPath) {
  log(`Making proxies in ${rootPath}`);
  return getProxyFolders(rootPath).forEach(name => {
    ensureDirSync(name);
    writeFileSync(
      `${name}/package.json`,
      getProxyPackageContents(rootPath, name)
    );
    log(`Created ${name}`);
  });
}

function hasTSConfig(rootPath) {
  return existsSync(join(rootPath, "tsconfig.json"));
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
  makeModulesJSON,
  makeProxies,
  hasTSConfig
};
