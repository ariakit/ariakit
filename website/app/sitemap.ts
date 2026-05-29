import type { MetadataRoute } from "next";
import pagesConfig from "@/build-pages/config.js";
import index from "@/build-pages/index.ts";
import { getTagSlug, getTags } from "@/lib/tag.ts";

const date = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  const categories = pagesConfig.pages.map((page) => page.slug);
  const pages = categories.flatMap(
    (category) =>
      index[category]?.map((page) => `${category}/${page.slug}`) ?? [],
  );
  const tags = getTags().map((tag) => `tags/${getTagSlug(tag)}`);
  return [
    { url: "https://ariakit.com", lastModified: date },
    ...categories.map((category) => ({
      url: `https://ariakit.com/${category}`,
      lastModified: date,
    })),
    ...pages.map((page) => ({
      url: `https://ariakit.com/${page}`,
      lastModified: date,
    })),
    ...tags.map((tag) => ({
      url: `https://ariakit.com/${tag}`,
      lastModified: date,
    })),
  ];
}
