import * as React from "react";
import { injectGlobal } from "emotion";
import { graphql } from "gatsby";
import RehypeReact from "rehype-react";
import {
  PlaygroundPreview,
  PlaygroundEditor,
  usePlaygroundState
} from "reakit-playground";
import CoreLayout from "../components/CoreLayout";
import FiraCodeBold from "../fonts/FiraCode-Bold.woff";
import FiraCodeLight from "../fonts/FiraCode-Light.woff";
import FiraCodeMedium from "../fonts/FiraCode-Medium.woff";
import FiraCodeRegular from "../fonts/FiraCode-Regular.woff";

injectGlobal`
  @font-face {
    font-family: "Fira Code";
    src: url(${FiraCodeLight});
    font-weight: 300;
    font-style: normal;
  }
  @font-face {
    font-family: "Fira Code";
    src: url(${FiraCodeRegular});
    font-weight: 400;
    font-style: normal;
  }
  @font-face {
    font-family: "Fira Code";
    src: url(${FiraCodeMedium});
    font-weight: 500;
    font-style: normal;
  }
  @font-face {
    font-family: "Fira Code";
    src: url(${FiraCodeBold});
    font-weight: 700;
    font-style: normal;
  }
  .CodeMirror {
    font-family: "Fira Code", monospace !important;
    font-size: 1em !important;
  }
`;

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
    return first.type === "code" ? first : null;
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
    pre: (props: React.HTMLAttributes<any>) => {
      const codeElement = getChildrenCode(props);
      if (codeElement) {
        const { static: isStatic, className } = codeElement.props;
        const [, lang] =
          className.match(/language-((?:j|t)sx?)/) || ([] as any[]);
        const state = usePlaygroundState(() => ({ code: getText(props) }));
        if (!lang) {
          return <PlaygroundEditor readOnly="nocursor" {...state} {...props} />;
        }
        if (isStatic) {
          return <PlaygroundEditor readOnly="nocursor" {...state} />;
        }
        return (
          <div>
            <PlaygroundPreview {...state} />
            <PlaygroundEditor {...state} />
          </div>
        );
      }
      return <pre {...props} />;
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
