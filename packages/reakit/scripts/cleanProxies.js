const rimraf = require("rimraf");
const publicFiles = require("./publicFiles");

Object.keys(publicFiles).forEach(module => {
  rimraf.sync(module);
});
