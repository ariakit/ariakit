const fs = require("fs");
const path = require("path");

module.exports = pathToFile =>
  fs.readFileSync(path.resolve(pathToFile), "utf8");
