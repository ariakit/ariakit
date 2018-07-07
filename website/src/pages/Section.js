import React from "react";
import { styled, Block, Heading, Link, Flex } from "reakit";
import { prop } from "styled-tools";
import { Redirect, Link as RouterLink } from "react-router-dom";
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
    margin-left: -8px;
    margin-right: -8px;
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

const NavLink = styled(Link.as(RouterLink))`
  font-size: 1.75em;
  @media (max-width: 768px) {
    font-size: 1.2em;
  }
`;

const ArticleNavigation = styled(Flex)`
  border-top: 1px solid ${prop("theme.grayLightest")};
  margin-top: 1em;
  padding-top: 1em;
  justify-content: space-between;
  @media (max-width: 768px) {
    padding: 8px 1em;
    position: sticky;
    bottom: 0px;
    background-color: white;
    z-index: 300;
  }
`;

const NavText = styled(RouterLink)`
  display: block;
  text-decoration: none;
  color: inherit;
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
      const next = findNonEmptySiblingSection(sections, section.name);
      const previous = findNonEmptySiblingSection(sections, section.name, true);
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
            <ArticleNavigation>
              {previous && (
                <Block>
                  <NavText to={getSectionUrl(sections, previous)}>
                    Previous article
                  </NavText>
                  <NavLink to={getSectionUrl(sections, previous)}>
                    {previous.name}
                  </NavLink>
                </Block>
              )}
              {next && (
                <Block textAlign="right" marginLeft="auto">
                  <NavText to={getSectionUrl(sections, next)}>
                    Next article
                  </NavText>
                  <NavLink to={getSectionUrl(sections, next)}>
                    {next.name}
                  </NavLink>
                </Block>
              )}
            </ArticleNavigation>
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
