import SEODescription from "./components/seo-description";
import SEOTitle from "./components/seo-title";

export default function Head() {
  const title = "Ariakit - Toolkit for building accessible UIs";
  const description =
    "Lower-level component library for building accessible higher-level UI libraries, design systems and web applications with React.";
  const url = "https://ariakit.org";
  const keywords = "react, accessibility, components, ui, a11y, accessible";

  return (
    <>
      <SEOTitle value={title} />
      <SEODescription value={description} />

      <meta name="keywords" key="keywords" content={keywords} />

      <meta name="og:type" key="og:type" content="website" />
      <meta name="og:url" key="og:url" content={url} />

      <meta name="twitter:card" content="summary" />
      <meta name="twitter:site" content="@ariakitjs" />
      <meta name="twitter:creator" content="@diegohaz" />

      <link
        rel="apple-touch-icon"
        href="/apple-touch-icon.png"
        sizes="180x180"
      />
      <link
        rel="icon"
        type="image/png"
        href="/favicon-32x32.png"
        sizes="32x32"
      />
      <link
        rel="icon"
        type="image/png"
        href="/favicon-16x16.png"
        sizes="16x16"
      />
      <link rel="icon" type="image/svg+xml" href="/icon.svg" />
      <link
        rel="icon"
        type="image/svg+xml"
        href="/icon-dark.svg"
        media="(prefers-color-scheme: dark)"
      />
    </>
  );
}
