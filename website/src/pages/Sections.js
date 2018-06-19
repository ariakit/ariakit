import React from "react";
import { Route } from "react-router-dom";
import { styled, Flex } from "reakit";
import Menu from "../components/Menu";
import Section from "../components/Section";

const Wrapper = styled(Flex)``;

const Sections = ({ match, ...props }) => (
  <Wrapper {...props}>
    <Menu sections={props.allSections} />
    <Route path={match.url} render={p => <Section {...props} {...p} />} />
  </Wrapper>
);

export default Sections;
