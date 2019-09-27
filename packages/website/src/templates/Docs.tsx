// TODO: Refactor this mess
import * as React from "react";
import { graphql } from "gatsby";
import RehypeReact from "rehype-react";
import {
  PlaygroundPreview,
  PlaygroundEditor,
  usePlaygroundState
} from "reakit-playground";
import * as emotion from "emotion";
import * as styled from "styled-components";
import * as spring from "react-spring";
import * as yup from "yup";
import set from "lodash/set";
import createUseContext from "constate";
import { FaUniversalAccess } from "react-icons/fa";
import CarbonAd from "../components/CarbonAd";
import Anchor from "../components/Anchor";
import Paragraph from "../components/Paragraph";
import List from "../components/List";
import KeyboardInput from "../components/KeyboardInput";
import Blockquote from "../components/Blockquote";
import TestTube from "../icons/TestTube";
import Heading from "../components/Heading";
import SEO from "../components/SEO";
import track from "../utils/track";
import DocsBackNext from "../components/DocsBackNext";
import Summary from "../components/Summary";

type DocsProps = {
  pageContext: {
    sourceUrl: string;
    readmeUrl: string;
    tableOfContentsAst: string;
    nextPagePath: string;
    prevPagePath: string;
  };
  data: {
    markdownRemark: {
      title: string;
      htmlAst: object;
      excerpt: string;
      frontmatter: {
        path: string;
        experimental: boolean;
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

const { Compiler: renderAst } = new RehypeReact({
  createElement: React.createElement,
  components: {
    "carbon-ad": CarbonAd,
    a: Anchor,
    p: Paragraph,
    ul: List,
    kbd: KeyboardInput,
    blockquote: Blockquote,
    summary: Summary,
    h1: Heading,
    h2: props => <Heading as="h2" {...props} />,
    h3: props => <Heading as="h3" {...props} />,
    h4: props => <Heading as="h4" {...props} />,
    h5: props => <Heading as="h5" {...props} />,
    h6: props => <Heading as="h6" {...props} />,
    span: (props: React.HTMLAttributes<any>) => {
      if (props.title === "Experimental") {
        return (
          <span {...props}>
            <TestTube />
          </span>
        );
      }
      return <span {...props} />;
    },
    pre: (props: React.HTMLAttributes<any>) => {
      const codeElement = getChildrenCode(props);
      if (codeElement) {
        const { static: isStatic, maxHeight, className } = codeElement.props;
        let [, mode] = className.match(/language-(.+)/) || ([] as any[]);

        const modeMap = {
          html: "htmlmixed",
          js: "javascript"
        };

        if (mode in modeMap) {
          mode = modeMap[mode as keyof typeof modeMap];
        }

        const isDynamic =
          !isStatic && ["js", "jsx", "ts", "tsx"].indexOf(mode) !== -1;
        const [code] = codeElement.props.children;
        const state = usePlaygroundState({ code });

        React.useEffect(() => {
          state.update(code);
        }, [state.update, code]);

        if (isDynamic) {
          return (
            <div>
              <PlaygroundPreview
                modules={{
                  emotion,
                  yup,
                  "lodash/set": set,
                  "styled-components": styled,
                  constate: createUseContext,
                  "react-spring": spring,
                  "./UniversalAccess": FaUniversalAccess
                }}
                {...state}
              />
              <PlaygroundEditor
                mode={mode}
                maxHeight={maxHeight}
                onBlur={track("reakit.codeMirrorBlur")}
                {...state}
              />
            </div>
          );
        }

        return (
          <PlaygroundEditor
            readOnly
            mode={mode}
            maxHeight={maxHeight}
            {...state}
            {...props}
          />
        );
      }
      return <pre {...props} />;
    }
  }
});

export default function Docs({ data, pageContext }: DocsProps) {
  const {
    markdownRemark: { title, htmlAst, excerpt }
  } = data;
  const { nextPagePath, prevPagePath } = pageContext;

  return (
    <>
      <SEO title={`${title} – Reakit`} description={excerpt} />
      <Heading>{title}</Heading>
      {renderAst(htmlAst)}
      <DocsBackNext nextPath={nextPagePath} prevPath={prevPagePath} />
    </>
  );
}

export const pageQuery = graphql`
  query($path: String!) {
    markdownRemark(frontmatter: { path: { eq: $path } }) {
      title
      htmlAst
      excerpt
      frontmatter {
        path
      }
    }
  }
`;
