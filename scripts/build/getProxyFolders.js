const getPublicFiles = require("./getPublicFiles");
const getSourcePath = require("./getSourcePath");

/**
 * Returns ["module", "path/to/module", ...]
 */
function getProxyFolders(rootPath) {
  const publicFiles = getPublicFiles(getSourcePath(rootPath));
  return Object.keys(publicFiles)
    .map(name => name.replace(/\/index$/, ""))
    .filter(name => name !== "index");
}

module.exports = getProxyFolders;
