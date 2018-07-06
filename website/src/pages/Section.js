import React from "react";
import { styled, Block, Heading, Link } from "reakit";
import { prop } from "styled-tools";
import { Redirect } from "react-router-dom";
import OpenInNewIcon from "react-icons/lib/md/open-in-new";
import StyleguidistContainer from "../containers/StyleguidistContainer";
import Playground from "../components/Playground";
import Markdown from "../components/Markdown";
import findSectionByLocation from "../utils/findSectionByLocation";
import getSectionContent from "../utils/getSectionContent";
import getSectionUrl from "../utils/getSectionUrl";
import findNonEmptySiblingSection from "../utils/findNonEmptySiblingSection";
import SectionUses from "../components/SectionUses";

const Wrapper = styled(Block)`
  @media (max-width: 768px) {
    overflow: auto;
    margin-left: -8px;
    width: 100vw;
  }
`;

const Name = styled(Heading)`
  @media (max-width: 768px) {
    padding: 0 8px;
  }
`;

const GithubSrcLink = styled(Link)`
  margin-bottom: 0.35em;
  @media (max-width: 768px) {
    padding: 0 8px;
  }
`;

const Content = styled(Block)`
  border-top: 1px solid ${prop("theme.grayLightest")};
  margin-top: 1em;
  padding-top: 1em;
`;

const StyledSectionUses = styled(SectionUses)`
  @media (max-width: 768px) {
    padding: 0 8px;
  }
`;

const sectionMap = {
  markdown: ({ content }, key) => <Markdown text={content} key={key} />,
  code: ({ content, evalInContext }, key) => (
    <Playground code={content} evalInContext={evalInContext} key={key} />
  )
};

const Section = ({ location, ...props }) => (
  <StyleguidistContainer>
    {({ sections }) => {
      const section = findSectionByLocation(sections, location);
      const sectionContent = getSectionContent(section);
      if (sectionContent) {
        return (
          <Wrapper {...props}>
            <Name>{section.name}</Name>
            {section.props.githubSrcUrl && (
              <GithubSrcLink href={section.props.githubSrcUrl} target="_blank">
                View source on GitHub <OpenInNewIcon />
              </GithubSrcLink>
            )}
            {section.name !== "Base" && <StyledSectionUses section={section} />}
            {section.name !== "Base" && (
              <StyledSectionUses usedBy section={section} />
            )}
            <Content>
              {sectionContent.map(
                ({ type, ...rest }, i) =>
                  sectionMap[type]
                    ? sectionMap[type](rest, section.name + i)
                    : null
              )}
            </Content>
          </Wrapper>
        );
      }
      return (
        <Redirect
          to={getSectionUrl(
            sections,
            findNonEmptySiblingSection(sections, section)
          )}
        />
      );
    }}
  </StyleguidistContainer>
);

export default Section;
