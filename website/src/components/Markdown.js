import React from "react";
import PropTypes from "prop-types";
import unescape from "lodash/unescape";
import { compiler } from "markdown-to-jsx";
import { styled, Paragraph, Link, Heading, List, Code } from "reakit";
import { Link as RouterLink } from "react-router-dom";
import OpenInNewIcon from "react-icons/lib/md/open-in-new";
import Editor from "./Editor";
import Blockquote from "../elements/Blockquote";

const StyledParagraph = styled(Paragraph)`
  line-height: 1.5;
  @media (max-width: 768px) {
    padding: 0 8px;
  }
`;

const StyledHeading = styled(Heading)`
  @media (max-width: 768px) {
    padding: 0 8px;
  }
`;

const StyledList = styled(List)`
  list-style: initial;
  padding-left: 2em;
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
  return <Link as={RouterLink} to={href} {...props} />;
};

const CodeBlock = ({ children }) => (
  <Editor
    readOnly
    code={unescape(children.props.children.replace(/<[^>]+>/g, ""))}
  />
);

const asComponent = (component, as) => ({ component, props: { as } });

const overrides = {
  p: StyledParagraph,
  a: Anchor,
  ul: StyledList,
  code: Code,
  pre: CodeBlock,
  blockquote: Blockquote,
  ol: asComponent(List, "ol"),
  h1: asComponent(StyledHeading, "h1"),
  h2: asComponent(StyledHeading, "h2"),
  h3: asComponent(StyledHeading, "h3"),
  h4: asComponent(StyledHeading, "h4"),
  h5: asComponent(StyledHeading, "h5"),
  h6: asComponent(StyledHeading, "h6")
};

const Markdown = ({ text }) => compiler(text, { overrides, forceBlock: true });

Markdown.propTypes = {
  text: PropTypes.string.isRequired
};

export default Markdown;
