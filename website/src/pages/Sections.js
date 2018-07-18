import React from "react";
import { Route } from "react-router-dom";
import { styled } from "reakit";
import Menu from "../components/Menu";
import StyleguidistContainer from "../containers/StyleguidistContainer";
import CoreLayout from "../layouts/CoreLayout";
import ContentWrapper from "../elements/ContentWrapper";
import findSectionByLocation from "../utils/findSectionByLocation";
import Section from "./Section";
import NotFound from "./NotFound";

const getSlug = pathname => pathname.split("/")[1];

const Content = styled(ContentWrapper)`
  display: grid;
  grid-template-columns: 1fr 200px;
  grid-gap: 32px;
  margin-top: 40px;
  align-items: start;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const StyledMenu = styled(Menu)`
  position: sticky;
  top: 100px;
  overflow: auto;
  padding-right: 16px;
  max-height: calc(100vh - 136px);
  @media (max-width: 768px) {
    display: none;
  }
`;

const Sections = ({ location, match }) => (
  <StyleguidistContainer>
    {({ sections }) => {
      const section = sections.find(s => s.slug === getSlug(location.pathname));
      const matchedSection = findSectionByLocation(sections, location);

      if (!matchedSection) {
        return <NotFound />;
      }

      return (
        <CoreLayout>
          <Content>
            <Route path={match.url} component={Section} />
            <StyledMenu
              section={section}
              showFilter={section.slug === "components"}
            />
          </Content>
        </CoreLayout>
      );
    }}
  </StyleguidistContainer>
);

export default Sections;
