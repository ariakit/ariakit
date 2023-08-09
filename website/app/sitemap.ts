import pagesConfig from "build-pages/config.js";
import index from "build-pages/index.js";
import type { MetadataRoute } from "next";
import { getTagSlug, getTags } from "utils/tag.js";

const date = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  const categories = pagesConfig.pages.map((page) => page.slug);
  const pages = categories.flatMap((category) =>
    index[category]!.map((page) => `${category}/${page.slug}`),
  );
  const tags = getTags().map((tag) => `tags/${getTagSlug(tag)}`);
  return [
    { url: "https://ariakit.org", lastModified: date },
    ...categories.map((category) => ({
      url: `https://ariakit.org/${category}`,
      lastModified: date,
    })),
    ...pages.map((page) => ({
      url: `https://ariakit.org/${page}`,
      lastModified: date,
    })),
    ...tags.map((tag) => ({
      url: `https://ariakit.org/${tag}`,
      lastModified: date,
    })),
  ];
}
