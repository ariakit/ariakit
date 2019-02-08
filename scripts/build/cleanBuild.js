const rimraf = require("rimraf");
const getBuildFolders = require("./getBuildFolders");
const log = require("../log");

function cleanBuild(rootPath) {
  log(`Cleaning ${rootPath}`);
  return getBuildFolders(rootPath)
    .filter(name => !/\//.test(name))
    .forEach(name => {
      try {
        rimraf.sync(name);
        log(`Cleaned ${name}`);
      } catch (e) {
        log(`Couldn't clean ${name}`);
      }
    });
}

module.exports = cleanBuild;
