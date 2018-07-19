import React from "react";
import { styled, Block } from "reakit";
import { prop } from "styled-tools";
import { Redirect } from "react-router-dom";
import { Helmet } from "react-helmet";
import StyleguidistContainer from "../containers/StyleguidistContainer";
import Playground from "../components/Playground";
import Markdown from "../components/Markdown";
import findSectionByLocation from "../utils/findSectionByLocation";
import getSectionContent from "../utils/getSectionContent";
import getSectionUrl from "../utils/getSectionUrl";
import findNonEmptySiblingSection from "../utils/findNonEmptySiblingSection";
import SectionUses from "../components/SectionUses";
import PropTypesTable from "../components/PropTypesTable";
import SectionNavigation from "../components/SectionNavigation";
import ContainerAPITable from "../components/ContainerAPITable";
import SectionGitHubButtons from "../components/SectionGitHubButtons";

const Wrapper = styled(Block)`
  width: 920px;
  max-width: calc(100vw - 264px);
  @media (max-width: 768px) {
    margin-left: -8px;
    margin-right: -8px;
    max-width: 100vw;
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
      if (sectionContent) {
        return (
          <Wrapper {...props}>
            <Helmet>
              <title>{section.name} - ReaKit</title>
            </Helmet>
            <SectionGitHubButtons section={section} />
            {section.name !== "Base" && (
              <React.Fragment>
                <SectionUses section={section} />
                <SectionUses usedBy section={section} />
              </React.Fragment>
            )}
            <Content>
              {sectionContent.map(
                ({ type, ...rest }, i) =>
                  sectionMap[type]
                    ? sectionMap[type](rest, section.name + i)
                    : null
              )}
            </Content>
            <ContainerAPITable section={section} />
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
