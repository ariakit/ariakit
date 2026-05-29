import { basename, dirname, extname } from "node:path";
import { kebabCase } from "lodash-es";
import { PAGE_INDEX_FILE_REGEX, PAGE_SOLID_REGEX } from "./const.js";

/**
 * Returns the page name from a file path. It's usually the file name, but for
 * index and readme files it's the directory name.
 *
 * Solid examples are currently special cased, the name is suffixed with
 * `__solid`.
 * @param {string | import("./types.js").Reference} filename
 */
export function getPageName(filename) {
  if (typeof filename !== "string") {
    return kebabCase(filename.name);
  }
  const isIndexFile = PAGE_INDEX_FILE_REGEX.test(filename);
  const isSolid = PAGE_SOLID_REGEX.test(filename);
  const name = isIndexFile
    ? `${basename(dirname(filename))}${isSolid ? "__solid" : ""}`
    : `${basename(filename, extname(filename))}`;
  // Remove leading digits.
  return name.replace(/^\d+-/, "");
}
