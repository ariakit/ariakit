import React from "react";
import { styled, Block, Heading, Link, Flex } from "reakit";
import { prop } from "styled-tools";
import { Redirect } from "react-router-dom";
import CodeIcon from "react-icons/lib/md/code";
import EditIcon from "react-icons/lib/md/edit";
import StyleguidistContainer from "../containers/StyleguidistContainer";
import Playground from "../components/Playground";
import Markdown from "../components/Markdown";
import findSectionByLocation from "../utils/findSectionByLocation";
import getSectionContent from "../utils/getSectionContent";
import getSectionUrl from "../utils/getSectionUrl";
import getSectionGithubSrcUrl from "../utils/getSectionGithubSrcUrl";
import findNonEmptySiblingSection from "../utils/findNonEmptySiblingSection";
import SectionUses from "../components/SectionUses";
import ButtonTransparent from "../elements/ButtonTransparent";

const Wrapper = styled(Block)`
  @media (max-width: 768px) {
    overflow: auto;
    margin-left: -8px;
    width: 100vw;
  }
`;

const Header = styled(Flex)`
  align-items: center;

  @media (max-width: 768px) {
    padding: 0 8px;
  }
`;

const Name = styled(Heading)`
  margin-right: auto;
`;

const GithubSrcButtonText = styled(Link)`
  @media (max-width: 768px) {
    display: none;
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
      const githubDocUrl = getSectionGithubSrcUrl(section, "doc");
      const githubSrcUrl = getSectionGithubSrcUrl(section, "component");
      if (sectionContent) {
        return (
          <Wrapper {...props}>
            <Header>
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
            </Header>
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
