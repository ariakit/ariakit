const { basename } = require("path");
const rimraf = require("rimraf");
const publicFiles = require("./publicFiles");

Object.keys(publicFiles).forEach(file => {
  rimraf.sync(basename(file, ".js"));
});
