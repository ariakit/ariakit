import * as React from "react";
import { graphql } from "gatsby";
import RehypeReact from "rehype-react";
import {
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  P,
  Pre,
  Hidden,
  HiddenButton,
  useHiddenState
} from "reakit";

type DocsProps = {
  data: {
    markdownRemark: {
      title: string;
      htmlAst: object;
      headings: Array<{
        value: string;
        depth: number;
      }>;
      frontmatter: {
        title: string;
        path: string;
      };
    };
  };
};

function hasCodeChildren(props: { children?: React.ReactNode }) {
  const children = React.Children.toArray(props.children);
  if (children.length > 1) return false;
  const [first] = children;
  if (typeof first === "object" && first !== null && "type" in first) {
    return first.type === "code";
  }
  return false;
}

const { Compiler: renderAst } = new RehypeReact({
  createElement: React.createElement,
  components: {
    h1: H1,
    h2: H2,
    h3: H3,
    h4: H4,
    h5: H5,
    h6: H6,
    p: P,
    pre: ({
      static: isStatic,
      ...props
    }: { static?: boolean } & React.HTMLAttributes<any>) => {
      if (hasCodeChildren(props)) {
        return <Pre {...props} />;
      }
      return <Pre {...props} />;
    }
  }
});

export default function Docs({ data }: DocsProps) {
  const hiddenState = useHiddenState();
  const {
    markdownRemark: { title, htmlAst }
  } = data;
  return (
    <div>
      <HiddenButton {...hiddenState}>Button</HiddenButton>
      <Hidden hideOnClickOutside hideOnEsc {...hiddenState}>
        Hidden
      </Hidden>
      <h1>{title}</h1>
      {renderAst(htmlAst)}
    </div>
  );
}

export const pageQuery = graphql`
  query($path: String!) {
    markdownRemark(frontmatter: { path: { eq: $path } }) {
      title
      htmlAst
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
