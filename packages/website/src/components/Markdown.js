import React from "react";
import PropTypes from "prop-types";
import unescape from "lodash/unescape";
import { compiler } from "markdown-to-jsx";
import {
  styled,
  use,
  Paragraph,
  Link,
  Heading,
  List,
  Code,
  Blockquote
} from "reakit";
import { Link as RouterLink } from "react-router-dom";
import OpenInNewIcon from "react-icons/lib/md/open-in-new";
import getSectionUrl from "../utils/getSectionUrl";
import StyleguidistContainer from "../containers/StyleguidistContainer";
import Editor from "./Editor";

const StyledParagraph = styled(Paragraph)`
  font-size: 18px;
  @media (max-width: 768px) {
    font-size: 16px;
    padding: 0 16px;
  }
`;

const StyledHeading = styled(Heading)`
  margin: 1.5em 0 1em;
  @media (max-width: 768px) {
    padding: 0 16px;
  }
`;

const StyledList = styled(List)`
  list-style: initial;
  padding-left: 2em;
  font-size: 18px;
  margin-bottom: 1em;
  @media (max-width: 768px) {
    font-size: 16px;
  }
  li {
    line-height: 1.5;
  }
`;

const Anchor = ({ href, ...props }) => {
  if (/^(http|www)/.test(href)) {
    return (
      <Link href={href} target="_blank" {...props}>
        {props.children}
        <OpenInNewIcon />
      </Link>
    );
  }
  if (/\.md$/.test(href)) {
    return (
      <StyleguidistContainer>
        {({ sections }) => (
          <Link
            use={RouterLink}
            to={getSectionUrl(
              sections,
              href
                .split("/")
                .pop()
                .replace(".md", "")
            )}
            {...props}
          />
        )}
      </StyleguidistContainer>
    );
  }
  return <Link use={RouterLink} to={href} {...props} />;
};

const CodeBlock = ({ children }) => (
  <Editor
    readOnly
    code={unescape(children.props.children.replace(/<[^>]+>/g, ""))}
  />
);

const overrides = {
  p: {
    component: StyledParagraph
  },
  a: {
    component: Anchor
  },
  ul: {
    component: StyledList
  },
  code: {
    component: Code
  },
  pre: {
    component: CodeBlock
  },
  blockquote: {
    component: Blockquote
  },
  ol: {
    component: use(List, "ol")
  },
  h1: {
    component: use(StyledHeading, "h1")
  },
  h2: {
    component: use(StyledHeading, "h2")
  },
  h3: {
    component: use(StyledHeading, "h3")
  },
  h4: {
    component: use(StyledHeading, "h4")
  },
  h5: {
    component: use(StyledHeading, "h5")
  },
  h6: {
    component: use(StyledHeading, "h6")
  }
};

const Markdown = ({ text }) => compiler(text, { overrides, forceBlock: true });

Markdown.propTypes = {
  text: PropTypes.string.isRequired
};

export default Markdown;
