import React from "react";
import Markdown from "react-styleguidist/lib/rsg-components/Markdown";
// import Preview from "react-styleguidist/lib/rsg-components/Preview";
import { styled, Block, Heading, InlineFlex } from "reakit";
import { Redirect } from "react-router-dom";
import Editor from "../components/Editor";
import Preview from "../components/Preview";
import StyleguidistContainer from "../containers/StyleguidistContainer";

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

const sectionMap = {
  markdown: ({ content }) => <Markdown text={content} />,
  code: ({ content, evalInContext }) => (
    <div>
      <Preview code={content} evalInContext={evalInContext} />
      <Editor code={content} />
    </div>
  )
};

const Section = props => (
  <StyleguidistContainer>
    {({ sections }) => {
      const section = getSection({ sections, ...props });
      const sectionContent = section.hasExamples
        ? section.props.examples
        : section.content;
      if (sectionContent) {
        return (
          <Wrapper {...props}>
            <Name>{section.name}</Name>
            <PathLine>{section.pathLine}</PathLine>
            {sectionContent.map(
              ({ type, ...others }) =>
                sectionMap[type] ? sectionMap[type](others) : null
            )}
          </Wrapper>
        );
      }
      return (
        <Redirect
          to={`${props.location.pathname}/${section.sections[0].slug}`}
        />
      );
    }}
  </StyleguidistContainer>
);

export default Section;
