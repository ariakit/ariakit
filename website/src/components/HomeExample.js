import React from "react";
import { Flex } from "reas";
import Editor from "./Editor";
import HomeExampleUI from "./HomeExampleUI";
import Box from "./Box";

const Wrapper = Flex.extend`
  width: 100%;
  justify-content: center;
  background-color: #282b36;
  margin: 40px 0;
`;

const Content = Flex.extend`
  max-width: 1200px;
  height: 400px;
`;

const code = `import React from "react";
import { Button, Popover } from "reas";

const MenuButton = 
`;

const HomeExample = props => (
  <Wrapper {...props}>
    <Content>
      <Editor readOnly code="ol" />
    </Content>
  </Wrapper>
);

export default HomeExample;
