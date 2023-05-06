import { basename, dirname, extname } from "path";
import { PAGE_INDEX_FILE_REGEX } from "./const.js";

/**
 * Returns the page name from a file path. It's usually the file name, but for
 * index and readme files it's the directory name.
 * @param {string} filename
 */
export function getPageName(filename) {
  const isIndexFile = PAGE_INDEX_FILE_REGEX.test(filename);
  const name = isIndexFile
    ? `${basename(dirname(filename))}`
    : `${basename(filename, extname(filename))}`;
  // Remove leading digits.
  return name.replace(/^\d+\-/, "");
}
