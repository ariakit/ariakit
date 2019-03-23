import * as React from "react";
import { graphql } from "gatsby";
import RehypeReact from "rehype-react";
import { Preview, Editor, useEditorState } from "reakit-playground";
import {
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  P,
  Pre,
  Code
} from "reakit-system-classic/components";
import CoreLayout from "../components/CoreLayout";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/dracula.css";
import "./codemirror.css";

if (typeof navigator !== "undefined") {
  require("codemirror/mode/jsx/jsx");
  require("codemirror/mode/htmlmixed/htmlmixed");
}

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

function getChildrenCode(props: { children?: React.ReactNode }) {
  const children = React.Children.toArray(props.children);
  const [first] = children;
  if (typeof first === "object" && first !== null && "type" in first) {
    return first.type === "code" || first.type === Code ? first : null;
  }
  return null;
}

function getText(props: { children?: React.ReactNode }): string {
  const children = React.Children.toArray(props.children);
  return children.reduce<string>((acc, curr) => {
    if (typeof curr === "string") {
      return `${acc}${curr}`;
    }
    if (typeof curr === "object" && curr !== null && "props" in curr) {
      return `${acc}${getText(curr.props)}`;
    }
    return acc;
  }, "");
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
    code: Code,
    pre: (props: React.HTMLAttributes<any>) => {
      const codeElement = getChildrenCode(props);
      if (codeElement) {
        const { static: isStatic, className } = codeElement.props;
        const [, lang] =
          className.match(/language-((?:j|t)sx?)/) || ([] as any[]);
        if (!lang) {
          return <Pre {...props} />;
        }
        const state = useEditorState({ code: () => getText(props) });
        if (isStatic) {
          return <Editor readOnly {...state} />;
        }
        return (
          <>
            <Preview {...state} />
            <Editor {...state} />
          </>
        );
      }
      return <Pre {...props} />;
    }
  }
});

function Comp({ data }: DocsProps) {
  const {
    markdownRemark: { title, htmlAst }
  } = data;
  return (
    <>
      <h1>{title}</h1>
      {renderAst(htmlAst)}
    </>
  );
}

export default function Docs(props: DocsProps) {
  return (
    <CoreLayout>
      <Comp {...props} />
    </CoreLayout>
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
