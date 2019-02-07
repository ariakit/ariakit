const { readdirSync } = require("fs");
const { join } = require("path");

function getIndexPath(path) {
  return join(
    path,
    readdirSync(path).find(file => /^index\.(j|t)sx?/.test(file))
  );
}

module.exports = getIndexPath;
