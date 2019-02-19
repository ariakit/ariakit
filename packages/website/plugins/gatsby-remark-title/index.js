const remove = require("unist-util-remove");
const getFirstHeading = require("./getFirstHeading");

function plugin({ markdownAST }) {
  const heading = getFirstHeading(markdownAST);
  if (!heading) return;
  remove(markdownAST, node => node === heading);
}

module.exports = plugin;
