import React from "react";
import { styled, Flex } from "reas";
import Menu from "./Menu";

const Wrapper = styled(Flex)``;

const Guide = props => (
  <Wrapper {...props}>
    <Menu sections={props.allSections} />
  </Wrapper>
);

export default Guide;
