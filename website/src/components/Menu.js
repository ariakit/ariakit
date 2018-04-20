import React from "react";
import { Block } from "reas";

const Wrapper = Block.extend``;

const Menu = ({ sections, ...props }) =>
  console.log(sections) || (
    <Wrapper {...props}>
      <Block>dsadsa</Block>
    </Wrapper>
  );

export default Menu;
