// @ts-check
import { readFileSync } from "fs";
import { basename, extname } from "path";
import { marked } from "marked";
import rehypeParse from "rehype-parse";
import { unified } from "unified";
import { getPageName } from "./get-page-name.mjs";
import { pathToPosix } from "./path-to-posix.mjs";

/**
 * Creates a page content string from a file path.
 * @param {string} filename
 */
function createPageContent(filename) {
  const title = getPageName(filename);
  const importPath = pathToPosix(basename(filename));
  const content = `# ${title}
<a href="./${importPath}" data-playground>Example</a>`;
  return content;
}

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
  const isMarkdown = extname(filename) === ".md";
  const content = isMarkdown
    ? readFileSync(filename, "utf8")
    : createPageContent(filename);
  return getPageTreeFromContent(content);
}
