import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/previews/", "/profile", "/sign-in", "/sign-up"],
    },
    sitemap: "https://ariakit.org/sitemap.xml",
  };
}
