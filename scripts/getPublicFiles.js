const { lstatSync, readdirSync } = require("fs");
const { join } = require("path");

const removeExt = file => file.replace(/\.[^.]+$/, "");

const isDirectory = source => lstatSync(source).isDirectory();

const getIndexPath = dir =>
  join(dir, readdirSync(dir).find(file => /^index/.test(file)));

const isPublic = file => !/^_/.test(file);

const getPublicFiles = dir =>
  readdirSync(dir)
    .filter(isPublic)
    .reduce((acc, file) => {
      const path = join(dir, file);
      const finalPath = isDirectory(path) ? getIndexPath(path) : path;
      const others = isDirectory(path) ? getPublicFiles(path) : {};
      return {
        [removeExt(file)]: finalPath,
        ...others,
        ...acc
      };
    }, {});

module.exports = getPublicFiles;

console.log(getPublicFiles(join(__dirname, "../packages/reakit/src")));
