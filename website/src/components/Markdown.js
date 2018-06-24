import React from "react";
import PropTypes from "prop-types";
import unescape from "lodash/unescape";
import { compiler } from "markdown-to-jsx";
import { Paragraph, Link, Heading, List, Code } from "reakit";
import { Link as RouterLink } from "react-router-dom";
import OpenInNewIcon from "react-icons/lib/md/open-in-new";
import Editor from "./Editor";

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
  p: Paragraph,
  a: Anchor,
  ul: List,
  code: Code,
  pre: CodeBlock,
  ol: asComponent(List, "ol"),
  h1: asComponent(Heading, "h1"),
  h2: asComponent(Heading, "h2"),
  h3: asComponent(Heading, "h3"),
  h4: asComponent(Heading, "h4"),
  h5: asComponent(Heading, "h5"),
  h6: asComponent(Heading, "h6")
};

const Markdown = ({ text }) => compiler(text, { overrides, forceBlock: true });

Markdown.propTypes = {
  text: PropTypes.string.isRequired
};

export default Markdown;
