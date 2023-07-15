import { startCase } from "lodash-es";

/** @type {Record<string,string>} */
const categoryTitles = {
  guide: "Guide",
  components: "Components",
  examples: "Examples",
  blog: "Blog",
  reference: "API Reference",
};

/** @type {Record<string,string>} */
const searchTitles = {
  guide: "Search guide",
  components: "Search components",
  examples: "Search examples",
  blog: "Search blog",
  reference: "Search API",
};

/**
 * @param {string} category
 */
export function getPageTitle(category) {
  return categoryTitles[category] ?? startCase(category);
}

/**
 * @param {string} category
 */
export function getSearchTitle(category) {
  return searchTitles[category] ?? `Search ${category}`;
}
