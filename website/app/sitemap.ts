import pagesConfig from "build-pages/config.js";
import index from "build-pages/index.js";
import type { MetadataRoute } from "next";

const date = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  const categories = pagesConfig.pages.map((page) => page.slug);
  const pages = categories.flatMap((category) =>
    index[category]!.map((page) => ({
      url: `https://ariakit.org/${category}/${page.slug}`,
      lastModified: page.lastModified,
    }))
  );
  return [
    { url: "https://ariakit.org", lastModified: date },
    ...categories.map((category) => ({
      url: `https://ariakit.org/${category}`,
      lastModified: date,
    })),
    ...pages,
  ];
}
