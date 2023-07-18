import type { Metadata } from "next";

type OpenGraph = Exclude<Metadata["openGraph"], null | undefined>;
type OpenGraphType = "article" | "book" | "website";
type Twitter = Exclude<Metadata["twitter"], null | undefined>;
type TwitterCard = "summary" | "summary_large_image";

interface Props {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  keywords?: string;
  type?: OpenGraphType;
  openGraph?: OpenGraph;
  card?: TwitterCard;
  twitter?: Twitter;
  index?: boolean;
}

export function getNextPageMetadata({
  title = "Ariakit - Toolkit for building accessible UIs",
  description = "Lower-level component library for building accessible higher-level UI libraries, design systems and web applications with React.",
  url = "https://ariakit.org",
  keywords = "react, accessibility, components, ui, a11y, accessible",
  type = "website",
  image,
  openGraph,
  card = "summary",
  twitter,
  index = true,
}: Props = {}): Metadata {
  return {
    metadataBase: new URL(url),
    title,
    description,
    keywords,
    openGraph: {
      type,
      title,
      description,
      url,
      images: image,
      ...openGraph,
    },
    twitter: {
      card,
      site: "@ariakitjs",
      creator: "@diegohaz",
      ...twitter,
    },
    icons: {
      icon: [
        { url: "/favicon-32x32.png", sizes: "32x32" },
        { url: "/favicon-16x16.png", sizes: "16x16" },
        { url: "/icon.svg" },
        { url: "/icon-dark.svg", media: "(prefers-color-scheme: dark)" },
      ],
      apple: "/apple-touch-icon.png",
    },
    robots: {
      index,
    },
  };
}
