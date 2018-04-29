import React from "react";
import { Route } from "react-router-dom";
import { styled, Flex } from "reas";
import Menu from "../compounds/Menu";
import Section from "../compounds/Section";

const Wrapper = styled(Flex)``;

const Sections = ({ match, ...props }) => (
  <Wrapper {...props}>
    <Menu sections={props.allSections} />
    <Route path={match.url} render={p => <Section {...props} {...p} />} />
  </Wrapper>
);

export default Sections;
