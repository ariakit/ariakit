const path = require("path");
const convertImports = require("postcss-import");
const scopify = require("postcss-scopify");
const { kebabCase } = require("lodash");

function rewriteRootRule() {
  return (root) => {
    root.walkRules((rule) => {
      rule.selectors = rule.selectors.map((selector) => {
        if (selector === ":root") {
          return "&";
        }
        return selector;
      });
    });
  };
}

function addIdScope() {
  return (root) => {
    const filename = root.source.input.file;
    const componentName = path.basename(
      path.dirname(path.dirname(path.dirname(filename)))
    );
    const basename = path.basename(path.dirname(filename));
    const id = `${kebabCase(componentName)}--${kebabCase(basename)}`;
    return scopify(`#${id}`)(root);
  };
}

module.exports = {
  exec: true,
  plugins: [convertImports(), rewriteRootRule(), addIdScope()],
};
