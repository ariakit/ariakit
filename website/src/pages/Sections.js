import React from "react";
import { Route } from "react-router-dom";
import { styled, Grid } from "reakit";
import Menu from "../components/Menu";
import StyleguidistContainer from "../containers/StyleguidistContainer";
import CoreLayout from "../layouts/CoreLayout";
import findSectionByLocation from "../utils/findSectionByLocation";
import Section from "./Section";
import NotFound from "./NotFound";

const getSlug = pathname => pathname.split("/")[1];

const Content = styled(Grid)`
  position: relative;
  align-items: center;
  margin: 40px 250px 0;
  max-width: 800px;
  width: calc(100% - 250px);

  @media (max-width: 1300px) {
    margin-right: auto;
    padding-right: 32px;
    align-items: flex-start;
  }

  @media (max-width: 768px) {
    width: 100vw;
    max-width: auto;
    margin-left: auto;
    padding: 0;
  }
`;

const StyledMenu = styled(Menu)`
  position: fixed;
  top: 60px;
  left: 0;
  bottom: 0;
  overflow: auto;
  max-height: calc(100% - 60px);
  padding: 16px;
  width: 220px;
  background-color: #f6f6f6;
  z-index: 999;
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
        <CoreLayout headerShadowed>
          <StyledMenu
            section={section}
            showFilter={section.slug === "components"}
          />
          <Content>
            <Route path={match.url} component={Section} />
          </Content>
        </CoreLayout>
      );
    }}
  </StyleguidistContainer>
);

export default Sections;
