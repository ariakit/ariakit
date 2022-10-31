// @ts-check
const matter = require("gray-matter");
const { marked } = require("marked");

/**
 * @param {import('hast').Element | import('hast').ElementContent} node
 * @returns {node is import("hast").Element}
 */
function isPlaygroundNode(node) {
  if (!("tagName" in node)) return false;
  if (node.tagName !== "a") return false;
  if (!node.properties) return false;
  return "dataPlayground" in node.properties;
}

/**
 * @param {import('hast').Element} node
 */
function isPlaygroundParagraphNode(node) {
  if (node.tagName !== "p") return false;
  const [child] = node.children;
  if (!child) return false;
  return isPlaygroundNode(child);
}

/**
 * @param {string} content The markdown content.
 */
async function getPageTreeFromContent(content) {
  const { unified } = await import("unified");
  const { default: rehypeParse } = await import("rehype-parse");
  const { visit } = await import("unist-util-visit");
  const { toString } = await import("hast-util-to-string");

  const { data, content: contentWithoutMatter } = matter(content);

  const tree = unified()
    .use(rehypeParse, { fragment: true })
    .parse(marked(contentWithoutMatter));

  tree.data = { ...data, ...tree.data, tableOfContents: [] };

  visit(tree, "element", (node) => {
    /** @type any */
    const tableOfContents = tree.data?.tableOfContents;
    if (node.tagName === "h2") {
      const id = node.properties?.id;
      const text = toString(node);
      tableOfContents.push({ id, text });
    }
    if (node.tagName === "h3") {
      const lastH2 = tableOfContents[tableOfContents.length - 1];
      if (!lastH2) return;
      const id = node.properties?.id;
      const text = toString(node);
      lastH2.children = lastH2.children || [];
      lastH2.children.push({ id, text });
    }
  });

  return tree;
}

/**
 * @param {import("hast").Root} tree
 */
async function getTableOfContentsFromTree(tree) {
  const { visit } = await import("unist-util-visit");
  const { toString } = await import("hast-util-to-string");

  /** @type {import("./types").TableOfContents} */
  const tableOfContents = [];

  visit(tree, "element", (node) => {
    if (node.tagName === "h2") {
      const id = `${node.properties?.id}`;
      const text = toString(node);
      tableOfContents.push({ id, text });
    }
    if (node.tagName === "h3") {
      const lastH2 = tableOfContents[tableOfContents.length - 1];
      if (!lastH2) return;
      const id = `${node.properties?.id}`;
      const text = toString(node);
      lastH2.children = lastH2.children || [];
      lastH2.children.push({ id, text });
    }
  });

  return tableOfContents;
}

module.exports = {
  isPlaygroundNode,
  isPlaygroundParagraphNode,
  getPageTreeFromContent,
  getTableOfContentsFromTree,
};
