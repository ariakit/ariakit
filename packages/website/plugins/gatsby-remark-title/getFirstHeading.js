const select = require("unist-util-select");
const { first } = require("lodash");

function getFirstHeading(tree) {
  return first(select(tree, "heading").filter(node => node.depth === 1));
}

module.exports = getFirstHeading;
