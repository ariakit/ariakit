import * as React from "react";
import { graphql } from "gatsby";
import Markdown from "markdown-to-jsx";
import { H1, H2, H3, H4, H5, H6, P } from "reakit";

const overrides = {
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
  h5: H5,
  h6: H6,
  p: P
};

export default function Docs({ data }: any) {
  const { markdownRemark } = data; // data.markdownRemark holds our post data
  const { frontmatter, rawMarkdownBody } = markdownRemark;
  return (
    <div>
      <h1>{frontmatter.title}</h1>
      <Markdown options={{ overrides }}>{rawMarkdownBody}</Markdown>
    </div>
  );
}

export const pageQuery = graphql`
  query($path: String!) {
    markdownRemark(frontmatter: { path: { eq: $path } }) {
      rawMarkdownBody
      headings {
        value
        depth
      }
      frontmatter {
        title
        path
      }
    }
  }
`;
