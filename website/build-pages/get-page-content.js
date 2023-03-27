// @ts-check
import { readFileSync } from "fs";
import { basename, extname } from "path";
import { getPageName } from "./get-page-name.js";
import { pathToPosix } from "./path-to-posix.js";

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
 * Gets the page tree from a file path.
 * @param {string} filename
 */
export function getPageContent(filename) {
  const isMarkdown = extname(filename) === ".md";
  const content = isMarkdown
    ? readFileSync(filename, "utf8")
    : createPageContent(filename);
  return content;
}
