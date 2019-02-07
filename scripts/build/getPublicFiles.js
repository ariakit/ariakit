const { readdirSync } = require("fs");
const { join } = require("path");
const isDirectory = require("./isDirectory");

function removeExt(path) {
  return path.replace(/\.[^.]+$/, "");
}

function isPublicModule(path) {
  return !/^_/.test(path);
}

/**
 * Returns {
 *   index: <path>,
 *   moduleName: <path>,
 *   ...
 * }
 */
function getPublicFiles(rootPath, prefix = "") {
  return readdirSync(rootPath)
    .filter(isPublicModule)
    .reduce((acc, filename) => {
      const path = join(rootPath, filename);
      const childFiles = isDirectory(path) && getPublicFiles(path, filename);
      return {
        ...(childFiles || { [removeExt(join(prefix, filename))]: path }),
        ...acc
      };
    }, {});
}

module.exports = getPublicFiles;
