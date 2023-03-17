// @ts-check
import { marked } from "marked";
import rehypeParse from "rehype-parse";
import { unified } from "unified";
import { getPageContent } from "./get-page-content.mjs";

/**
 * Returns the page tree from a markdown content string.
 * @param {string} content
 */
export function getPageTreeFromContent(content) {
  const tree = unified()
    .use(rehypeParse, { fragment: true })
    .parse(marked(content));
  return tree;
}

/**
 * Gets the page tree from a file path.
 * @param {string} filename
 */
export function getPageTreeFromFile(filename) {
  const content = getPageContent(filename);
  return getPageTreeFromContent(content);
}
