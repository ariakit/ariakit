import React from "react";
import { Route } from "react-router-dom";
import { styled } from "reakit";
import Menu from "../components/Menu";
import StyleguidistContainer from "../containers/StyleguidistContainer";
import CoreLayout from "../layouts/CoreLayout";
import ContentWrapper from "../elements/ContentWrapper";
import Section from "./Section";

const getSlug = pathname => pathname.split("/")[1];

const Content = styled(ContentWrapper)`
  display: grid;
  grid-template-columns: 1fr 200px;
  grid-gap: 32px;
  margin-top: 60px;
  align-items: start;
`;

const StyledMenu = styled(Menu)`
  position: sticky;
  top: 120px;
  overflow: auto;
  padding-right: 16px;
`;

const Sections = ({ location, match }) => (
  <StyleguidistContainer>
    {({ sections }) => {
      const section = sections.find(s => s.slug === getSlug(location.pathname));
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
