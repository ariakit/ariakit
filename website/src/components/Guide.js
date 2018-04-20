import React from "react";
import { Flex } from "reas";
import Menu from "./Menu";

const Wrapper = Flex.extend``;

const Guide = props => (
  <Wrapper {...props}>
    <Menu sections={props.allSections} />
  </Wrapper>
);

export default Guide;
