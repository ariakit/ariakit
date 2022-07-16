import Head from "next/head";

type SEOProps = {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  keywords?: string;
};

export default function SEO({
  title = "Ariakit - Toolkit for building accessible UIs",
  description = "Lower-level component library for building accessible higher-level UI libraries, design systems and web applications with React.",
  url = "https://ariakit.org",
  keywords = "react, accessibility, components, ui, a11y",
  image,
}: SEOProps) {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" key="description" content={description} />
      <meta name="keywords" key="keywords" content={keywords} />

      <meta name="og:title" key="og:title" content={title} />
      <meta name="og:type" key="og:type" content="website" />
      <meta name="og:url" key="og:url" content={url} />
      <meta name="og:description" key="og:description" content={description} />
      {image && <meta property="og:image" key="og:image" content={image} />}

      <meta name="twitter:card" content="summary" />
      <meta name="twitter:site" content="@ariakitjs" />
      <meta name="twitter:creator" content="@diegohaz" />
    </Head>
  );
}
