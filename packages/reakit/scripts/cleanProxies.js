const rimraf = require("rimraf");
const publicFiles = require("./publicFiles");

Object.keys(publicFiles).forEach(module => {
  try {
    rimraf.sync(module);
  } catch (e) {
    // ignore
  }
});
