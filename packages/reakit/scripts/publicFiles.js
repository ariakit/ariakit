const { lstatSync, readdirSync } = require("fs");
const { join } = require("path");

const removeExt = file => file.replace(/\.[^.]+$/, "");

const isDirectory = source => lstatSync(source).isDirectory();

const getIndex = dir =>
  join(dir, readdirSync(dir).find(file => /^index/.test(file)));

const getFiles = dir =>
  readdirSync(dir)
    .filter(file => !/^(index\.|__)/.test(file))
    .reduce((acc, file) => {
      const path = join(dir, file);
      const finalPath = isDirectory(path) ? getIndex(path) : path;
      return {
        ...acc,
        [removeExt(file)]: finalPath
      };
    }, {});

module.exports = {
  ...getFiles("./src/components"),
  ...getFiles("./src/enhancers")
};
