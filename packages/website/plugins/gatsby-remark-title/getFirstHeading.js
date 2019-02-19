const { select } = require("unist-util-select");

function getFirstHeading(tree) {
  return select("heading[depth=1]", tree);
}

module.exports = getFirstHeading;
