const { join, dirname } = require("path");

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

function getSourcePath(rootPath) {
  return join(rootPath, "src");
}

module.exports = {
  getPackage,
  getModuleDir,
  getTypesDir,
  getMainDir,
  getSourcePath
};
