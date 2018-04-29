import React from "react";
import { styled, Flex, Grid } from "reas";
import Editor from "./Editor";
import HomeExampleUI from "./HomeExampleUI";

// eslint-disable-next-line
import code from "!!raw-loader!./Example.js";

const Wrapper = styled(Flex)`
  width: 100%;
  justify-content: center;
  background-color: #282a36;
  margin: 40px 0;
`;

const Content = styled(Grid)`
  max-width: 1200px;
  grid-gap: 20px;
  grid-auto-flow: column;
  align-items: end;
  @media (max-width: 768px) {
    grid-auto-flow: row;
  }
`;

const HomeExample = props => (
  <Wrapper {...props}>
    <Content>
      <Editor readOnly code={code.trim()} />
      <HomeExampleUI />
    </Content>
  </Wrapper>
);

export default HomeExample;
