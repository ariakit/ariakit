import React from "react";
import Markdown from "react-styleguidist/lib/rsg-components/Markdown";
import { styled, Block, Heading, InlineFlex } from "reakit";
import { Redirect } from "react-router-dom";
import StyleguidistContainer from "../containers/StyleguidistContainer";
import Playground from "../components/Playground";

const Wrapper = styled(Block)`
  overflow: auto;

  [class*="rsg--code"] {
    font-family: "Fira Code", monospace;
  }

  p > code {
    background-color: rgba(0, 0, 0, 0.05);
    padding: 2px 5px;
    font-family: "Fira Code", monospace;
    cursor: inherit;
  }

  [class*="rsg--pre"] {
    width: 100%;
    line-height: 1.2rem;
    padding: 1em;
    height: auto;
    max-width: 100%;
    margin-bottom: 20px;

    code {
      font-size: 14px;
      @media screen and (max-width: 640px) {
        font-size: 13px;
      }
    }

    &:not([class*="preview"]) {
      overflow: auto;
    }
  }

  [class*="CodeWrapper"]:first-of-type {
    margin-top: 0;
  }
`;

const Name = styled(Heading)``;

const PathLine = styled(InlineFlex)`
  margin-bottom: 3em;
`;

const getSection = ({ location, sections }) => {
  const slugs = location.pathname.split("/").filter(Boolean);
  return slugs.filter(Boolean).reduce((section, slug) => {
    const items = Array.isArray(section) ? section : section.sections;
    return items.find(item => item.slug === slug);
  }, sections);
};

const getSectionContent = section =>
  section.hasExamples ? section.props.examples : section.content;

const getNextNonEmptyPath = (sections, path = "/") => {
  const [section] = sections;
  const normalizePath = p => p.replace(/\/+/g, "/");
  const nextPath = `${path}/${section.slug}`;
  if (getSectionContent(section)) return normalizePath(nextPath);
  return getNextNonEmptyPath(section.sections, nextPath);
};

const sectionMap = {
  markdown: ({ content }, key) => <Markdown text={content} key={key} />,
  code: ({ content, evalInContext }, key) => (
    <Playground code={content} evalInContext={evalInContext} key={key} />
  )
};

const Section = props => (
  <StyleguidistContainer>
    {({ sections }) => {
      const section = getSection({ sections, ...props });
      const sectionContent = getSectionContent(section);
      if (sectionContent) {
        return (
          <Wrapper {...props}>
            <Name>{section.name}</Name>
            <PathLine>{section.pathLine}</PathLine>
            {sectionContent.map(
              ({ type, ...rest }, i) =>
                sectionMap[type]
                  ? sectionMap[type](rest, section.name + i)
                  : null
            )}
          </Wrapper>
        );
      }
      return (
        <Redirect
          to={getNextNonEmptyPath(section.sections, props.location.pathname)}
        />
      );
    }}
  </StyleguidistContainer>
);

export default Section;
