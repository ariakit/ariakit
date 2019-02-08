const { writeFileSync } = require("fs");
const { join } = require("path");
const getBuildFolders = require("./getBuildFolders");
const log = require("../log");

function makeGitignore(rootPath) {
  const buildFolders = getBuildFolders(rootPath);
  const contents = `${buildFolders
    .filter(name => !/\//.test(name))
    .map(name => `/${name}`)
    .join("\n")}\n`;
  writeFileSync(join(rootPath, ".gitignore"), contents);
  log(`Created .gitignore in ${rootPath}`);
}

module.exports = makeGitignore;
