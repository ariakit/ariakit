const { join } = require("path");

function getSourcePath(rootPath) {
  return join(rootPath, "src");
}

module.exports = getSourcePath;
