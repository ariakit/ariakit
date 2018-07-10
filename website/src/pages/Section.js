import React from "react";
import { styled, Block, Heading, Flex, Base } from "reakit";
import { prop } from "styled-tools";
import { Redirect } from "react-router-dom";
import { Helmet } from "react-helmet";
import CodeIcon from "react-icons/lib/md/code";
import EditIcon from "react-icons/lib/md/edit";
import StyleguidistContainer from "../containers/StyleguidistContainer";
import Playground from "../components/Playground";
import Markdown from "../components/Markdown";
import findSectionByLocation from "../utils/findSectionByLocation";
import getSectionContent from "../utils/getSectionContent";
import getSectionUrl from "../utils/getSectionUrl";
import getSectionGitHubUrl from "../utils/getSectionGitHubUrl";
import findNonEmptySiblingSection from "../utils/findNonEmptySiblingSection";
import SectionUses from "../components/SectionUses";
import ButtonTransparent from "../elements/ButtonTransparent";
import PropTypesTable from "../components/PropTypesTable";
import SectionNavigation from "../components/SectionNavigation";

const Wrapper = styled(Block)`
  @media (max-width: 768px) {
    margin-left: -8px;
    margin-right: -8px;
    max-width: 100vw;
  }
`;

const ContentWrapper = styled(Flex)`
  @media (max-width: 768px) {
    padding: 0 16px;
  }
`;

const Name = styled(Heading)`
  margin-right: auto;
`;

const GithubSrcButtonText = styled(Base)`
  @media (max-width: 768px) {
    display: none;
  }
`;

const Content = styled(Block)`
  border-top: 1px solid ${prop("theme.grayLightest")};
  margin-top: 1em;
  padding-top: 1em;
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
      const githubDocUrl = getSectionGitHubUrl(section, "md");
      const githubSrcUrl = getSectionGitHubUrl(section, "js");
      if (sectionContent) {
        return (
          <Wrapper {...props}>
            <Helmet>
              <title>{section.name} - ReaKit</title>
            </Helmet>
            <ContentWrapper alignItems="center">
              <Name>{section.name}</Name>
              <Flex>
                {githubSrcUrl && (
                  <ButtonTransparent as="a" href={githubSrcUrl} target="_blank">
                    <CodeIcon />
                    <GithubSrcButtonText>
                      View source on GitHub
                    </GithubSrcButtonText>
                  </ButtonTransparent>
                )}
                {githubDocUrl && (
                  <ButtonTransparent as="a" href={githubDocUrl} target="_blank">
                    <EditIcon />
                    <GithubSrcButtonText>Improve this page</GithubSrcButtonText>
                  </ButtonTransparent>
                )}
              </Flex>
            </ContentWrapper>
            {section.name !== "Base" && (
              <ContentWrapper as={SectionUses} section={section} />
            )}
            {section.name !== "Base" && (
              <ContentWrapper as={SectionUses} usedBy section={section} />
            )}
            <Content>
              {sectionContent.map(
                ({ type, ...rest }, i) =>
                  sectionMap[type]
                    ? sectionMap[type](rest, section.name + i)
                    : null
              )}
            </Content>
            <PropTypesTable section={section} />
            <SectionNavigation section={section} />
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
