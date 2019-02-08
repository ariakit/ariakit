const getProxyFolders = require("./getProxyFolders");
const { getMainDir, getUnpkgDir, getModuleDir, getTypesDir } = require("./pkg");

function getBuildFolders(rootPath) {
  return [
    getMainDir(rootPath),
    getUnpkgDir(rootPath),
    getModuleDir(rootPath),
    getTypesDir(rootPath),
    ...getProxyFolders(rootPath)
  ].filter(Boolean);
}

module.exports = getBuildFolders;
