const path = require("path");
const scopify = require("postcss-scopify");
const { kebabCase } = require("lodash");

function getId(filename) {
  const basename = path.basename(path.dirname(filename));
  return `examples--${kebabCase(basename)}`;
}

module.exports = {
  exec: true,
  plugins: [(root) => scopify(`#${getId(root.source.input.file)}`)(root)],
};
