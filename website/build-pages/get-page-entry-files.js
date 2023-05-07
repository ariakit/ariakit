import { readdirSync } from "fs";
import { join } from "path";
import { PAGE_FILE_REGEX } from "./const.js";
import { getPageName } from "./get-page-name.js";
import { pathToPosix } from "./path-to-posix.js";

/**
 * Reads a directory recursively and returns a list of files that match the
 * given pattern.
 * @param {string | string[]} context
 * @param {RegExp} pattern
 * @param {string[]} [files]
 */
export function getPageEntryFiles(
  context,
  pattern = PAGE_FILE_REGEX,
  files = [],
  cont = true
) {
  const contexts = Array.isArray(context) ? context : [context];
  for (const context of contexts) {
    const items = readdirSync(context, { withFileTypes: true });
    if (context.includes("(examples)")) {
      console.log(readdirSync(context));
    }
    for (const item of items) {
      const itemPath = join(context, item.name);
      const posixPath = pathToPosix(itemPath);
      if (/node_modules/.test(itemPath)) continue;
      if (cont && item.isDirectory()) {
        getPageEntryFiles(itemPath, pattern, files, false);
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
  }
  return files;
}
