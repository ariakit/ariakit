const { lstatSync } = require("fs");

function isDirectory(path) {
  return lstatSync(path).isDirectory();
}

module.exports = isDirectory;
