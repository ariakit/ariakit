const visit = require("unist-util-visit");
const { get, set } = require("lodash");

function plugin({ markdownAST }) {
  visit(markdownAST, "code", node => {
    if (typeof node.lang !== "string" || !/\s/.test(node.lang)) {
      return;
    }
    let props = node.lang.replace(/^[\S]+\s/, "");

    if (!/\{/.test(props)) {
      props = `{ "${props}": true }`;
    }

    props = JSON.parse(props);

    set(
      node,
      "data.hProperties",
      Object.assign(get(node, "data.hProperties", {}), props)
    );
  });
}

module.exports = plugin;
