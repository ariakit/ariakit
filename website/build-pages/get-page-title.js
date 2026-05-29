import { startCase } from "lodash-es";

/** @type {Record<string,string>} */
const categoryTitles = {
  guide: "Guide",
  components: "Components",
  examples: "Examples",
  blog: "Blog",
  reference: "API Reference",
  changelog: "Changelog",
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
export function getPageTitle(category, fallback = false) {
  return categoryTitles[category] ?? (fallback ? startCase(category) : "");
}

/**
 * @param {string} category
 */
export function getSearchTitle(category) {
  return searchTitles[category] ?? `Search ${category}`;
}
