import React from "react";
import { styled, Block } from "reas";

const Wrapper = styled(Block)``;

const Menu = ({ sections, ...props }) =>
  console.log(sections) || (
    <Wrapper {...props}>
      <Block>dsadsa</Block>
    </Wrapper>
  );

export default Menu;
