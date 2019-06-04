import React from "react";
import Helmet from "react-helmet";
import { graphql, useStaticQuery } from "gatsby";
import thumbnail from "../images/thumbnail.png";

export type SEOProps = {
  description?: string;
  lang?: string;
  meta?: Array<{ property: string; content: string }>;
  keywords?: string[];
  title: string;
};

const defaultKeywords = ["react", "accessibility", "components", "ui", "a11y"];

export default function SEO({
  description,
  lang = "en",
  meta = [],
  keywords = [],
  title
}: SEOProps) {
  const data = useStaticQuery(detailsQuery);
  const metaDescription = description || data.site.siteMetadata.description;
  const metaTitle = title || data.site.siteMetadata.title;
  const url = data.site.siteMetadata.siteUrl;
  const image = url + thumbnail;
  return (
    <Helmet
      htmlAttributes={{ lang }}
      title={metaTitle}
      meta={[
        {
          name: "description",
          content: metaDescription
        },
        {
          property: "og:title",
          content: metaTitle
        },
        {
          property: "og:url",
          content: url
        },
        {
          property: "og:description",
          content: metaDescription
        },
        {
          property: "og:type",
          content: "website"
        },
        {
          property: "og:image",
          content: image
        },
        {
          name: "twitter:card",
          content: "summary_large_image"
        },
        {
          name: "twitter:image:src",
          content: image
        },
        {
          name: "twitter:creator",
          content: data.site.siteMetadata.author
        },
        {
          name: "twitter:title",
          content: metaTitle
        },
        {
          name: "twitter:description",
          content: metaDescription
        },
        {
          name: "keywords",
          content: defaultKeywords.concat(keywords).join(", ")
        }
      ].concat(meta)}
    />
  );
}

const detailsQuery = graphql`
  query DefaultSEOQuery {
    site {
      siteMetadata {
        title
        description
        siteUrl
        author
      }
    }
  }
`;
