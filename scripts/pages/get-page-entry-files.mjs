// @ts-check
import { readdirSync } from "fs";
import { join } from "path";
import { getPageName } from "./get-page-name.mjs";
import { pathToPosix } from "./path-to-posix.mjs";

/**
 * Reads a directory recursively and returns a list of files that match the
 * given pattern.
 * @param {string} context
 * @param {RegExp} pattern
 * @param {string[]} [files]
 */
export function getPageEntryFiles(context, pattern, files = []) {
  const items = readdirSync(context, { withFileTypes: true });
  for (const item of items) {
    const itemPath = join(context, item.name);
    const posixPath = pathToPosix(itemPath);
    if (/node_modules/.test(itemPath)) continue;
    if (item.isDirectory()) {
      getPageEntryFiles(itemPath, pattern, files);
    } else if (pattern.test(posixPath)) {
      const pageName = getPageName(posixPath);
      const index = files.findIndex((file) => getPageName(file) === pageName);
      if (index !== -1) {
        files.splice(index, 1, posixPath);
      } else {
        files.push(posixPath);
      }
    }
  }
  return files;
}
