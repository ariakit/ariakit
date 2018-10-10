import React from "react";
import PropTypes from "prop-types";
import unescape from "lodash/unescape";
import { compiler } from "markdown-to-jsx";
import {
  styled,
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
            as={RouterLink}
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
